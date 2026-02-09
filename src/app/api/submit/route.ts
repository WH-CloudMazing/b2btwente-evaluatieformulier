import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

interface FormPayload {
  contactBron: string;
  interesse: string;
  verbetersuggestie?: string;
  naam: string;
  functie: string;
  onderneming: string;
  vestigingsplaats: string;
  telefoonnummer: string;
  email: string;
  datum: string;
}

const VALID_INTERESSE = ["gast", "lid", "geen", "suggestie"];

function validatePayload(
  body: unknown
): { valid: true; data: FormPayload } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Ongeldig verzoek." };
  }

  const data = body as Record<string, unknown>;

  const requiredFields = [
    "contactBron",
    "interesse",
    "naam",
    "functie",
    "onderneming",
    "vestigingsplaats",
    "telefoonnummer",
    "email",
    "datum",
  ];

  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== "string" || !String(data[field]).trim()) {
      return { valid: false, error: `Veld "${field}" is verplicht.` };
    }
  }

  if (!VALID_INTERESSE.includes(data.interesse as string)) {
    return { valid: false, error: "Ongeldige keuze voor interesse." };
  }

  if (data.interesse === "suggestie") {
    if (
      !data.verbetersuggestie ||
      typeof data.verbetersuggestie !== "string" ||
      !String(data.verbetersuggestie).trim()
    ) {
      return {
        valid: false,
        error: "Verbetersuggestie is verplicht bij deze keuze.",
      };
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email as string)) {
    return { valid: false, error: "Ongeldig e-mailadres." };
  }

  return {
    valid: true,
    data: {
      contactBron: String(data.contactBron).trim(),
      interesse: String(data.interesse).trim(),
      verbetersuggestie: data.verbetersuggestie
        ? String(data.verbetersuggestie).trim()
        : undefined,
      naam: String(data.naam).trim(),
      functie: String(data.functie).trim(),
      onderneming: String(data.onderneming).trim(),
      vestigingsplaats: String(data.vestigingsplaats).trim(),
      telefoonnummer: String(data.telefoonnummer).trim(),
      email: String(data.email).trim(),
      datum: String(data.datum).trim(),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validatePayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await sendEmail(result.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
