import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

interface GitHubRepo {
  id: number;
  name: string;
  owner: {
    login: string;
  };
}

async function fetchGitHubUsername(githubToken: string): Promise<string> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${githubToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub username');
  }

  const userData = await response.json();
  return userData.login;
}

async function fetchAllGitHubRepos(githubToken: string): Promise<GitHubRepo[]> {
  let allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&page=${page}&visibility=all`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch GitHub repositories: ${response.statusText}`);
      throw new Error(`Failed to fetch GitHub repositories: ${response.statusText}`);
    }

    const repos = await response.json();
    allRepos = allRepos.concat(repos);

    if (repos.length < perPage) {
      break; // If less than `per_page` repos are returned, exit the loop
    }

    page++;
  }

  return allRepos;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const githubToken = session.accessToken;

    if (!githubToken) {
      return res.status(404).json({ error: 'GitHub token not found' });
    }

    // Fetch the GitHub username using the token
    const githubUsername = await fetchGitHubUsername(githubToken);

    // Fetch the repositories using the token
    const repos = await fetchAllGitHubRepos(githubToken);

    res.status(200).json({ username: githubUsername, repos });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
}
