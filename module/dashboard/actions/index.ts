"use server";

import { auth } from "@/lib/auth";
import {
  fetchUserContribution,
  getGithubToken,
} from "@/module/github/lib/github";
import { headers } from "next/headers";
import { Octokit } from "octokit";

export async function getContributionStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("unauthorized");
    }
    const token = await getGithubToken();

    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;
    const calendar = await fetchUserContribution(token, username);
    if (!calendar) {
      return null;
    }

    const contributions = calendar.weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: Math.min(4, Math.floor(day.contributionCount / 3)),
      }))
    );
    return {
      contributions,
      totalContributions: calendar.totalContribution
    }
  } catch (error) {
    console.log(error);
    return null
  }
}

export async function getDashboardStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    // Get user's GitHub account
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // TODO: Fetch all connected repositories from DB
    const totalRepos = 48;

    const calendar = await fetchUserContribution(token, user.login);
    const totalCommits = calendar?.totalContributions || 0;

    // Count PRs (GitHub)
    const { data: pullRequests } =
      await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user.login} type:pr`,
        per_page: 1,
      });

    const totalPRs = pullRequests.total_count;

    // TODO: Count AI reviews from DB
    const totalReviews = 44;

    return {
      totalCommits,
      totalPRs,
      totalReviews,
      totalRepos,
    };
  } catch (error) {
    console.error(error);
    return {
      totalCommits: 0,
      totalPRs: 0,
      totalReviews: 0,
      totalRepos: 0,
    };
  }
}

export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const calendar = await fetchUserContribution(token, user.login);

    if (!calendar) return [];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    type MonthlyStats = {
      activity: number; // commits + prs + reviews (GitHub definition)
      prs: number;
      reviews: number;
    };

    const monthlyData: Record<string, MonthlyStats> = {};

    /* -------------------- initialize last 6 months -------------------- */
    const now = new Date();
    now.setDate(1);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyData[key] = { activity: 0, prs: 0, reviews: 0 };
    }

    /* -------------------- activity (calendar data) -------------------- */
    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const date = new Date(day.date);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        if (monthlyData[key]) {
          monthlyData[key].activity += day.contributionCount;
        }
      });
    });

    /* -------------------- PRs (last 6 months) -------------------- */
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const { data: prs } =
      await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user.login} type:pr created:>=${sixMonthsAgo
          .toISOString()
          .split("T")[0]}`,
        per_page: 100,
      });

    prs.items.forEach((pr: any) => {
      const date = new Date(pr.created_at);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (monthlyData[key]) {
        monthlyData[key].prs += 1;
      }
    });

    /* -------------------- reviews (TEMP MOCK — TODO replace with DB) -------------------- */
    const reviews = Array.from({ length: 45 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i * 3);
      return { createdAt: d };
    });

    reviews.forEach((review) => {
      const date = review.createdAt;
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (monthlyData[key]) {
        monthlyData[key].reviews += 1;
      }
    });

    /* -------------------- format for charts -------------------- */
    return Object.entries(monthlyData).map(([name, values]) => ({
      name,
      ...values,
    }));
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    return [];
  }
}
