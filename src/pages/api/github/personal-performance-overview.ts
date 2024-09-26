// pages/api/personal-performance-overview.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

interface PersonalPerformanceData {
  prsMerged: number;
  commitsMerged: number;
  linesAdded: number;
  linesDeleted: number;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    tree: {
      url: string;
    };
  };
}

interface GitHubPullRequest {
  merged_at: string | null;
}

// The handler function with authentication
const handler = async (req: NextApiRequest, res: NextApiResponse<PersonalPerformanceData | { error: string }>) => {
  const { username, repo } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!username || !repo) {
    return res.status(400).json({ error: 'Username and repository are required' });
  }

  try {
    // Fetch the GitHub OAuth token from the session
    const githubToken = session.accessToken;

    if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not found for the user' });
    }

    // Fetch merged PRs from the GitHub API
    const prsResponse = await fetch(
      `https://api.github.com/repos/${username}/${repo}/pulls?state=closed&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }
    );

    const prsData: GitHubPullRequest[] = await prsResponse.json();

    const prsMerged = prsData.filter(pr => pr.merged_at !== null).length;

    // Fetch commits from the GitHub API
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${username}/${repo}/commits?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }
    );

    const commitsData: GitHubCommit[] = await commitsResponse.json();

    // Calculate the number of additions and deletions
    let linesAdded = 0;
    let linesDeleted = 0;
    let commitsMerged = 0;

    for (const commit of commitsData) {
      const commitDetailResponse = await fetch(
        `https://api.github.com/repos/${username}/${repo}/commits/${commit.sha}`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
          },
        }
      );

      const commitDetailData = await commitDetailResponse.json();
      linesAdded += commitDetailData.stats.additions;
      linesDeleted += commitDetailData.stats.deletions;

      // Check if the commit is in the production branch (e.g., 'main' or 'master')
      const prodBranch = 'main';
      if (commitDetailData.commit.tree.url.includes(prodBranch)) {
        commitsMerged += 1;
      }
    }

    const performanceData: PersonalPerformanceData = {
      prsMerged,
      commitsMerged,
      linesAdded,
      linesDeleted,
    };

    res.status(200).json(performanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching performance data' });
  }
};

export default handler;
