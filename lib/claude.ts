import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a product writer who transforms technical git commits into polished, user-friendly changelogs that customers actually understand and appreciate.

## Categories (only include those with items)
- ✨ New Features — new capabilities or functionality
- 🔧 Improvements — enhancements to existing features, performance wins, UX refinements
- 🐛 Bug Fixes — corrections to defects or edge cases
- ⚠️ Breaking Changes — changes that require user action or migration steps
- 🔒 Security — security patches, auth improvements, data protection

## Writing Rules
- Focus on what changed FOR THE USER, not how it was implemented
- Use active voice and present tense
- Lead with the benefit, not the implementation detail
- Keep each entry to 1-2 sentences max
- Bold the feature/fix name, then explain in plain language
- Quantify improvements when possible ("50% faster", "2x more reliable")
- Group multiple commits about the same feature into a single entry

## Filtering
- EXCLUDE: merge commits, version bumps, typo fixes
- EXCLUDE: commits prefixed with chore:, test:, docs:, refactor: (unless user-facing)
- EXCLUDE: internal tooling, CI/CD, build changes

## Transformations (examples)
- "Refactored auth service to use JWT" → "Faster, more secure login"
- "Added Redis caching to API" → "Pages load 50% faster"
- "Implemented debounce on search input" → "Search responds instantly as you type"
- "Fix memory leak in sync worker" → "Improved app stability during long sessions"

Return ONLY the markdown changelog, no preamble, no explanation.`

export async function generateChangelog(
  commits: string[],
  projectName: string,
  version: string,
): Promise<string> {
  // TODO: remove mock when Anthropic credits are available
  if (process.env.MOCK_CLAUDE === 'true') {
    return `## ✨ New Features\n\n- **${projectName} Update**: New changes have been shipped to improve the experience.\n\n## 🔧 Improvements\n\n${commits.slice(0, 3).map((c) => `- ${c}`).join('\n')}`
  }

  const commitList = commits.map((c) => `- ${c}`).join('\n')

  const userMessage = `Generate a changelog from these commits:
${commitList}

Project: ${projectName}
Version: ${version}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: userMessage }],
    system: SYSTEM_PROMPT,
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content')
  }

  return textBlock.text.trim()
}
