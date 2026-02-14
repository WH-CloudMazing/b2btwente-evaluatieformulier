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
  datum?: string;
}

const VALID_INTERESSE = ["gast", "lid", "geen", "suggestie"];
const MAX_FIELD_LENGTH = 500;
const MAX_SUGGESTIE_LENGTH = 2000;
const DATUM_REGEX = /^\d{1,2}\s\w+\s\d{4}$/;

// In-memory rate limiter: max 5 submissions per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(data.email as string)) {
    return { valid: false, error: "Ongeldig e-mailadres." };
  }

  let datumStr: string | undefined;
  if (data.datum && typeof data.datum === "string" && String(data.datum).trim()) {
    datumStr = String(data.datum).trim();
    if (!DATUM_REGEX.test(datumStr)) {
      return { valid: false, error: "Ongeldig datumformaat." };
    }
  }

  return {
    valid: true,
    data: {
      contactBron: truncate(String(data.contactBron).trim(), MAX_FIELD_LENGTH),
      interesse: String(data.interesse).trim(),
      verbetersuggestie: data.verbetersuggestie
        ? truncate(String(data.verbetersuggestie).trim(), MAX_SUGGESTIE_LENGTH)
        : undefined,
      naam: truncate(String(data.naam).trim(), MAX_FIELD_LENGTH),
      functie: truncate(String(data.functie).trim(), MAX_FIELD_LENGTH),
      onderneming: truncate(String(data.onderneming).trim(), MAX_FIELD_LENGTH),
      vestigingsplaats: truncate(String(data.vestigingsplaats).trim(), MAX_FIELD_LENGTH),
      telefoonnummer: truncate(String(data.telefoonnummer).trim(), MAX_FIELD_LENGTH),
      email: truncate(String(data.email).trim(), MAX_FIELD_LENGTH),
      datum: datumStr,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het over een minuut opnieuw." },
        { status: 429 }
      );
    }

    // Content-Type check
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type moet application/json zijn." },
        { status: 415 }
      );
    }

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
