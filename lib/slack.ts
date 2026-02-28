interface SlackPayload {
  projectName: string
  version: string
  content: string
  slug: string
}

export async function postToSlack(webhookUrl: string, data: SlackPayload): Promise<void> {
  const url = `${process.env.NEXTAUTH_URL}/p/${data.slug}`

  // Build a concise Slack summary (first 1200 chars of changelog)
  const preview = data.content.length > 1200 ? data.content.slice(0, 1200) + '...' : data.content

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 ${data.projectName} — ${data.version}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: preview,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View changelog', emoji: true },
            url,
            style: 'primary',
          },
        ],
      },
    ],
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    console.error(`Slack webhook failed: ${response.status} ${await response.text()}`)
  }
}
