import { GitHubRepoContext } from '@/types/interview';
import dns from 'node:dns';

// Ensure IPv4 first on Node/Windows to prevent long IPv6 connection timeouts to api.github.com
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // ignore in unsupported runtimes
}

export function extractGitHubUsername(inputUrlOrUsername: string): string | null {
  const trimmed = inputUrlOrUsername.trim().replace(/^@/, '');
  if (!trimmed) return null;

  try {
    const urlStr = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : trimmed.includes('github.com')
        ? `https://${trimmed}`
        : null;

    if (urlStr) {
      const url = new URL(urlStr);
      if (url.hostname.includes('github.com')) {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0 && /^[a-zA-Z0-9_-]+$/.test(parts[0])) {
          return parts[0];
        }
      }
    }
  } catch {
    // ignore URL parsing error
  }

  // Pure username
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export async function fetchGitHubProjects(username: string): Promise<GitHubRepoContext[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'AI-Mock-Interview-Coach',
  };

  const githubToken = process.env.GITHUB_TOKEN?.trim();
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=6`,
      {
        headers,
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!reposRes.ok) {
      if (reposRes.status === 404) {
        throw new Error(`GitHub user "${username}" was not found.`);
      }
      if (reposRes.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or configure a GITHUB_TOKEN.');
      }
      throw new Error(`GitHub API returned status ${reposRes.status}`);
    }

    const reposData = await reposRes.json();
    if (!Array.isArray(reposData) || reposData.length === 0) {
      return [];
    }

    // Prefer non-fork repositories if available
    const nonForks = reposData.filter((r: any) => !r.fork);
    const candidateRepos = (nonForks.length > 0 ? nonForks : reposData).slice(0, 3);

    const projects: GitHubRepoContext[] = await Promise.all(
      candidateRepos.map(async (repo: any) => {
        let readmeSummary: string | null = null;

        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/readme`,
            {
              headers,
              signal: AbortSignal.timeout(3500),
            }
          );

          if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            if (readmeData.content) {
              const decoded = Buffer.from(readmeData.content, 'base64').toString('utf-8');
              // Clean markdown badges, images, HTML tags, and excessive spacing
              const cleaned = decoded
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
                .replace(/<[^>]*>/g, '')
                .replace(/\n\s*\n+/g, '\n')
                .trim();
              readmeSummary = cleaned.slice(0, 800);
            }
          }
        } catch {
          // README fetch is best-effort
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
    console.error(`Error fetching GitHub repositories for "${username}":`, error?.message || error);
    throw error;
  }
}
