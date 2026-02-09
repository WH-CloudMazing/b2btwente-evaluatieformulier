"use client";

import { useState } from "react";
import SuccessMessage from "./SuccessMessage";

interface FormErrors {
  [key: string]: string;
}

const interesseOpties = [
  {
    value: "gast",
    label:
      "Ik kom graag nog eens als gast naar een bijeenkomst van B2B Twente",
    sublabel: "(max 2x per jaar)",
  },
  {
    value: "lid",
    label:
      "Ik word graag lid van B2B Twente en ontvang daarvoor een uitnodiging van de lidmaatschapscommissie",
  },
  {
    value: "geen",
    label: "Bedankt, maar ik heb geen interesse",
  },
  {
    value: "suggestie",
    label: "Verbetersuggestie voor B2B Twente:",
  },
];

function formatDatum(): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function EvaluatieFormulier() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [contactBron, setContactBron] = useState("");
  const [interesse, setInteresse] = useState("");
  const [verbetersuggestie, setVerbetersuggestie] = useState("");
  const [naam, setNaam] = useState("");
  const [functie, setFunctie] = useState("");
  const [onderneming, setOnderneming] = useState("");
  const [vestigingsplaats, setVestigingsplaats] = useState("");
  const [telefoonnummer, setTelefoonnummer] = useState("");
  const [email, setEmail] = useState("");

  const datum = formatDatum();

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!contactBron.trim()) errs.contactBron = "Dit veld is verplicht";
    if (!interesse) errs.interesse = "Maak een keuze";
    if (interesse === "suggestie" && !verbetersuggestie.trim())
      errs.verbetersuggestie = "Vul uw suggestie in";
    if (!naam.trim()) errs.naam = "Dit veld is verplicht";
    if (!functie.trim()) errs.functie = "Dit veld is verplicht";
    if (!onderneming.trim()) errs.onderneming = "Dit veld is verplicht";
    if (!vestigingsplaats.trim()) errs.vestigingsplaats = "Dit veld is verplicht";
    if (!telefoonnummer.trim()) errs.telefoonnummer = "Dit veld is verplicht";
    if (!email.trim()) {
      errs.email = "Dit veld is verplicht";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Ongeldig e-mailadres";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactBron: contactBron.trim(),
          interesse,
          verbetersuggestie:
            interesse === "suggestie" ? verbetersuggestie.trim() : undefined,
          naam: naam.trim(),
          functie: functie.trim(),
          onderneming: onderneming.trim(),
          vestigingsplaats: vestigingsplaats.trim(),
          telefoonnummer: telefoonnummer.trim(),
          email: email.trim(),
          datum,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verzenden mislukt");
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Er is een fout opgetreden. Probeer het later opnieuw."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setContactBron("");
    setInteresse("");
    setVerbetersuggestie("");
    setNaam("");
    setFunctie("");
    setOnderneming("");
    setVestigingsplaats("");
    setTelefoonnummer("");
    setEmail("");
    setErrors({});
    setServerError("");
  }

  if (submitted) {
    return <SuccessMessage onReset={handleReset} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-10"
    >
      {/* Title section */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">
          Evaluatieformulier Gasten B2B Twente
        </h2>
        <p className="text-text-muted">
          Hartelijk dank voor uw komst als gast bij B2B Twente!
        </p>
        <p className="text-text-muted text-sm mt-2">
          Wilt u zo vriendelijk zijn om dit formulier in te vullen? Alvast
          bedankt en succes in zaken!
        </p>
      </div>

      {/* Contact source */}
      <fieldset className="mb-8">
        <label
          htmlFor="contactBron"
          className="block text-sm font-medium text-text mb-2"
        >
          Ik ben met B2B Twente in contact gekomen via:
          <span className="text-error ml-1">*</span>
        </label>
        <input
          type="text"
          id="contactBron"
          value={contactBron}
          onChange={(e) => {
            setContactBron(e.target.value);
            if (errors.contactBron) setErrors((prev) => ({ ...prev, contactBron: "" }));
          }}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.contactBron ? "border-error" : "border-border"
          } text-text bg-white transition-colors`}
          placeholder="Bijv. een lid, evenement, website..."
        />
        {errors.contactBron && (
          <p className="mt-1 text-sm text-error">{errors.contactBron}</p>
        )}
      </fieldset>

      {/* Interest radio cards */}
      <fieldset className="mb-8">
        <legend className="block text-sm font-medium text-text mb-3">
          Uw interesse <span className="text-error">*</span>
        </legend>
        <div className="space-y-3">
          {interesseOpties.map((optie) => (
            <div key={optie.value}>
              <label
                className={`radio-card flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                  interesse === optie.value
                    ? "selected"
                    : errors.interesse
                      ? "border-error/40"
                      : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="interesse"
                  value={optie.value}
                  checked={interesse === optie.value}
                  onChange={(e) => {
                    setInteresse(e.target.value);
                    if (errors.interesse)
                      setErrors((prev) => ({ ...prev, interesse: "" }));
                  }}
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    interesse === optie.value
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  }`}
                >
                  {interesse === optie.value && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-sm leading-relaxed">
                  <span className="font-medium text-text">{optie.label}</span>
                  {optie.sublabel && (
                    <span className="text-text-muted"> {optie.sublabel}</span>
                  )}
                </span>
              </label>

              {/* Conditional textarea for suggestie */}
              {optie.value === "suggestie" && interesse === "suggestie" && (
                <div className="slide-in mt-3 ml-8">
                  <textarea
                    value={verbetersuggestie}
                    onChange={(e) => {
                      setVerbetersuggestie(e.target.value);
                      if (errors.verbetersuggestie)
                        setErrors((prev) => ({
                          ...prev,
                          verbetersuggestie: "",
                        }));
                    }}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.verbetersuggestie ? "border-error" : "border-border"
                    } text-text bg-white transition-colors resize-none`}
                    placeholder="Uw suggestie..."
                  />
                  {errors.verbetersuggestie && (
                    <p className="mt-1 text-sm text-error">
                      {errors.verbetersuggestie}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {errors.interesse && (
          <p className="mt-2 text-sm text-error">{errors.interesse}</p>
        )}
      </fieldset>

      {/* Divider */}
      <div className="border-t border-border my-8" />

      {/* Personal details */}
      <fieldset className="mb-8">
        <legend className="block text-sm font-medium text-text mb-4">
          Uw gegevens
        </legend>
        <div className="space-y-4">
          <FormField
            label="Naam"
            id="naam"
            value={naam}
            onChange={(v) => {
              setNaam(v);
              if (errors.naam) setErrors((prev) => ({ ...prev, naam: "" }));
            }}
            error={errors.naam}
            required
          />
          <FormField
            label="Functie"
            id="functie"
            value={functie}
            onChange={(v) => {
              setFunctie(v);
              if (errors.functie) setErrors((prev) => ({ ...prev, functie: "" }));
            }}
            error={errors.functie}
            required
          />
          <FormField
            label="Onderneming"
            id="onderneming"
            value={onderneming}
            onChange={(v) => {
              setOnderneming(v);
              if (errors.onderneming)
                setErrors((prev) => ({ ...prev, onderneming: "" }));
            }}
            error={errors.onderneming}
            required
          />
          <FormField
            label="Vestigingsplaats"
            id="vestigingsplaats"
            value={vestigingsplaats}
            onChange={(v) => {
              setVestigingsplaats(v);
              if (errors.vestigingsplaats)
                setErrors((prev) => ({ ...prev, vestigingsplaats: "" }));
            }}
            error={errors.vestigingsplaats}
            required
          />
          <FormField
            label="Telefoonnummer"
            id="telefoonnummer"
            type="tel"
            value={telefoonnummer}
            onChange={(v) => {
              setTelefoonnummer(v);
              if (errors.telefoonnummer)
                setErrors((prev) => ({ ...prev, telefoonnummer: "" }));
            }}
            error={errors.telefoonnummer}
            required
          />
          <FormField
            label="Persoonlijk E-mailadres"
            id="email"
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
            required
          />
        </div>
      </fieldset>

      {/* Date display */}
      <div className="flex items-center gap-2 mb-8 text-sm text-text-muted">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Datum: {datum}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {serverError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-submit w-full py-4 px-6 rounded-lg bg-primary text-white font-medium text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="spinner w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-25"
              />
              <path
                d="M12 2a10 10 0 0110 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Verzenden...
          </span>
        ) : (
          "Formulier verzenden"
        )}
      </button>
    </form>
  );
}

function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text mb-1">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-lg border ${
          error ? "border-error" : "border-border"
        } text-text bg-white transition-colors`}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
