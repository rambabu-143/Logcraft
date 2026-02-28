import { Octokit } from '@octokit/rest'

export function createOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken })
}

/**
 * Fetch commits on the default branch since a given SHA.
 * If `since` is null, fetches the last 50 commits.
 * Returns an array of commit message strings (author + message).
 */
export async function getCommitsSince(
  repoFullName: string,
  since: string | null,
  accessToken: string,
): Promise<string[]> {
  const octokit = createOctokit(accessToken)
  const [owner, repo] = repoFullName.split('/')

  const params: Parameters<typeof octokit.repos.listCommits>[0] = {
    owner,
    repo,
    per_page: 100,
  }

  if (since) {
    // Get the commit date of the `since` SHA so we can filter by date
    try {
      const { data: baseCommit } = await octokit.repos.getCommit({ owner, repo, ref: since })
      params.since = baseCommit.commit.author?.date ?? undefined
    } catch {
      // If we can't find the SHA (e.g. force-push), just fetch last 50
      params.per_page = 50
    }
  }

  const { data: commits } = await octokit.repos.listCommits(params)

  // Exclude the `since` commit itself and merge commits
  return commits
    .filter((c) => {
      if (c.sha === since) return false
      const msg = c.commit.message
      // Skip merge commits and automated bumps
      if (msg.startsWith('Merge ')) return false
      if (/^(chore|bump):?\s+version/i.test(msg)) return false
      return true
    })
    .map((c) => {
      const msg = c.commit.message.split('\n')[0].trim()
      const author = c.commit.author?.name ?? 'Unknown'
      return `${msg} (${author})`
    })
    .reverse() // oldest first
}

/**
 * Create a webhook on the repo. Returns the webhook ID.
 */
export async function createWebhook(
  repoFullName: string,
  webhookUrl: string,
  secret: string,
  accessToken: string,
): Promise<number> {
  const octokit = createOctokit(accessToken)
  const [owner, repo] = repoFullName.split('/')

  const { data } = await octokit.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: 'json',
      secret,
    },
    events: ['push', 'create'],
    active: true,
  })

  return data.id
}

/**
 * Delete a webhook from the repo.
 */
export async function deleteWebhook(
  repoFullName: string,
  webhookId: number,
  accessToken: string,
): Promise<void> {
  const octokit = createOctokit(accessToken)
  const [owner, repo] = repoFullName.split('/')
  await octokit.repos.deleteWebhook({ owner, repo, hook_id: webhookId })
}

/**
 * List all repos the authenticated user has access to (owned + org).
 */
export async function listUserRepos(
  accessToken: string,
): Promise<Array<{ id: number; fullName: string; private: boolean; description: string | null }>> {
  const octokit = createOctokit(accessToken)

  const repos: Array<{ id: number; fullName: string; private: boolean; description: string | null }> = []
  let page = 1

  while (true) {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      page,
      sort: 'updated',
      affiliation: 'owner,collaborator,organization_member',
    })
    if (data.length === 0) break
    repos.push(
      ...data.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        private: r.private,
        description: r.description,
      })),
    )
    if (data.length < 100) break
    page++
  }

  return repos
}
