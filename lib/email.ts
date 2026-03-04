import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'changelogs@changelogfy.com'

interface ChangelogEmailData {
  projectName: string
  version: string
  content: string
  slug: string
}

function buildEmailHtml(data: ChangelogEmailData): string {
  const url = `${process.env.NEXTAUTH_URL}/p/${data.slug}`
  // Convert markdown to very basic HTML for email
  const htmlContent = data.content
    .replace(/^## (.+)$/gm, '<h2 style="color:#1f2937;margin:20px 0 8px;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#374151;margin:16px 0 6px;">$1</h3>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;color:#4b5563;">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul style="padding-left:20px;margin:8px 0;">${m}</ul>`)
    .replace(/\n\n/g, '<br/>')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;">
  <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
      <span style="font-size:20px;">📋</span>
      <span style="font-weight:700;font-size:18px;color:#111827;">${data.projectName}</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 4px;">
      What's new in ${data.version}
    </h1>
    <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">
      A new changelog has been published.
    </p>
    <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
      ${htmlContent}
    </div>
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;">
      <a href="${url}" style="display:inline-block;background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;">
        View full changelog →
      </a>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
      You're receiving this because you subscribed to ${data.projectName} changelogs.
      <br/>
      Powered by <strong>Logcraft</strong>
    </p>
  </div>
</body>
</html>`
}

export async function sendChangelogEmail(
  emails: string[],
  data: ChangelogEmailData,
): Promise<void> {
  if (emails.length === 0) return

  // Send in batches of 50 (Resend batch limit)
  const batches = []
  for (let i = 0; i < emails.length; i += 50) {
    batches.push(emails.slice(i, i + 50))
  }

  const html = buildEmailHtml(data)
  const subject = `${data.projectName} ${data.version} — What's new`

  for (const batch of batches) {
    await resend.emails.send({
      from: FROM,
      to: batch,
      subject,
      html,
    })
  }
}
