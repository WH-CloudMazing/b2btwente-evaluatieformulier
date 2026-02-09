interface FormData {
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

const interesseLabels: Record<string, string> = {
  gast: "Ik kom graag nog eens als gast naar een bijeenkomst van B2B Twente (max 2x per jaar)",
  lid: "Ik word graag lid van B2B Twente en ontvang daarvoor een uitnodiging van de lidmaatschapscommissie",
  geen: "Bedankt, maar ik heb geen interesse",
  suggestie: "Verbetersuggestie voor B2B Twente",
};

function buildHtmlEmail(data: FormData): string {
  const interesseText = interesseLabels[data.interesse] || data.interesse;

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f0f0f0; font-family:'Roboto',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#ffffff; padding:24px 32px; text-align:center; border-bottom:3px solid #FF9800;">
              <h1 style="margin:0; color:#424242; font-size:22px; font-weight:700;">
                B2B TWENTE
              </h1>
              <p style="margin:4px 0 0; color:#8A8A8A; font-size:13px; letter-spacing:2px;">
                resultaatgericht netwerken
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:28px 32px 16px;">
              <h2 style="margin:0; color:#424242; font-size:18px;">
                Nieuw Evaluatieformulier Ontvangen
              </h2>
              <p style="margin:8px 0 0; color:#8A8A8A; font-size:14px;">
                Ingevuld op ${data.datum}
              </p>
            </td>
          </tr>

          <!-- Contact source -->
          <tr>
            <td style="padding:0 32px 16px;">
              <p style="margin:0 0 4px; color:#8A8A8A; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
                In contact gekomen via
              </p>
              <p style="margin:0; color:#424242; font-size:15px;">
                ${escapeHtml(data.contactBron)}
              </p>
            </td>
          </tr>

          <!-- Interest -->
          <tr>
            <td style="padding:0 32px 16px;">
              <p style="margin:0 0 4px; color:#8A8A8A; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
                Interesse
              </p>
              <p style="margin:0; color:#424242; font-size:15px;">
                ${escapeHtml(interesseText)}
              </p>
              ${
                data.interesse === "suggestie" && data.verbetersuggestie
                  ? `<p style="margin:8px 0 0; padding:12px; background-color:#f0f0f0; border-radius:8px; color:#424242; font-size:14px;">${escapeHtml(data.verbetersuggestie)}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none; border-top:1px solid #e6e6e6; margin:0;" />
            </td>
          </tr>

          <!-- Personal details table -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${detailRow("Naam", data.naam)}
                ${detailRow("Functie", data.functie)}
                ${detailRow("Onderneming", data.onderneming)}
                ${detailRow("Vestigingsplaats", data.vestigingsplaats)}
                ${detailRow("Telefoonnummer", data.telefoonnummer)}
                ${detailRow("E-mailadres", data.email)}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f0f0; padding:16px 32px; text-align:center; border-top:1px solid #e6e6e6;">
              <p style="margin:0; color:#8A8A8A; font-size:12px;">
                Dit formulier is verzonden via het online evaluatieformulier van B2B Twente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0; color:#8A8A8A; font-size:13px; width:140px; vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:6px 0; color:#424242; font-size:14px; font-weight:500;">
        ${escapeHtml(value)}
      </td>
    </tr>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendEmail(data: FormData): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const fromEmail = process.env.MAIL_FROM || "noreply@b2btwente.nl";
  const fromName = process.env.MAIL_FROM_NAME || "B2B Twente";
  const toEmail = process.env.MAILTO || "info@b2btwente.nl";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail }],
      replyTo: { email: data.email, name: data.naam },
      subject: `Evaluatieformulier - ${data.naam} (${data.onderneming})`,
      htmlContent: buildHtmlEmail(data),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${error}`);
  }
}
