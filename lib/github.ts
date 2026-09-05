import { GitHubRepoContext } from '@/types/interview';

export function extractGitHubUsername(inputUrlOrUsername: string): string | null {
  const trimmed = inputUrlOrUsername.trim();
  if (!trimmed) return null;

  // Handles https://github.com/username, github.com/username, or plain username
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)\/?$/i);
  if (match && match[1]) {
    return match[1];
  }

  // If already just a username (no slashes)
  if (/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export async function fetchGitHubProjects(username: string): Promise<GitHubRepoContext[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'AI-Mock-Interview-Coach',
  };

  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=3`,
      { headers, next: { revalidate: 300 } }
    );

    if (!reposRes.ok) {
      if (reposRes.status === 404) {
        throw new Error(`GitHub user "${username}" was not found.`);
      }
      if (reposRes.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or provide a GITHUB_TOKEN.');
      }
      throw new Error(`GitHub API returned status ${reposRes.status}`);
    }

    const reposData = await reposRes.json();
    if (!Array.isArray(reposData) || reposData.length === 0) {
      return [];
    }

    const projects: GitHubRepoContext[] = await Promise.all(
      reposData.map(async (repo: any) => {
        let readmeSummary: string | null = null;

        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/readme`,
            { headers, next: { revalidate: 300 } }
          );

          if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            if (readmeData.content) {
              const decoded = Buffer.from(readmeData.content, 'base64').toString('utf-8');
              // Clean markdown badges, markdown images, and excess whitespace
              const cleaned = decoded
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
                .replace(/<[^>]*>/g, '')
                .replace(/\n\s*\n+/g, '\n')
                .trim();
              readmeSummary = cleaned.slice(0, 600);
            }
          }
        } catch {
          // README fetch is best-effort; ignore errors
        }

        return {
          name: repo.name,
          description: repo.description || null,
          language: repo.language || null,
          readme_summary: readmeSummary,
          last_pushed: repo.pushed_at || repo.updated_at,
          url: repo.html_url,
        };
      })
    );

    return projects;
  } catch (error: any) {
    console.error('Error fetching GitHub repositories:', error);
    throw error;
  }
}
