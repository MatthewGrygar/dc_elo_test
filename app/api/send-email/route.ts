import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message, subject } = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "prague-dc-series@seznam.cz",
      subject: subject ?? `Zpráva od ${name} — DC ELO`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a2e; margin-bottom: 8px;">Nová zpráva z DC ELO</h2>
          <p style="color: #666; font-size: 13px; margin-bottom: 24px;">${subject ?? "Kontaktní formulář"}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; width: 100px;">Jméno</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px;">E-mail</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px;"><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px;">Telefon</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px;">${phone}</td></tr>` : ""}
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #f8f8f8; border-radius: 8px; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
          <p style="margin-top: 24px; font-size: 11px; color: #aaa;">Odesláno přes DC ELO kontaktní formulář</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-email error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}
