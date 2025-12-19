"use server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "@/module/github/lib/github";
import {
  canCreateReview,
  incrementReviewCount,
} from "@/module/payment/lib/subscription";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const repository = await prisma.repository.findFirst({
      where: {
        owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error(
        `Repository ${owner}/${repo} not found in database. Please reconnect the repository`
      );
    }

    const canReview = await canCreateReview(repository.user.id, repository.id);

    if (!canReview) {
      throw new Error(
        `Review limit reached for this repository. Please upgrade to Pro for unlimited reviews.`
      );
    }

    const githubAccount = repository.user.accounts[0];

    if (!githubAccount.accessToken) {
      throw new Error("No github access tokrn found");
    }

    const token = githubAccount.accessToken;

    //   what you change
    const { title } = await getPullRequestDiff(token, owner, repo, prNumber);

    await inngest.send({
      name: "pr.review.requested",
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.user.id,
      },
    });

    await incrementReviewCount(repository.user.id, repository.id);

    return { success: true, message: "Review Queued" };
  } catch (error) {
    try {
      const repository = await prisma.repository.findFirst({
        where: { owner, name: repo },
      });
      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: "Failed to Fetch PR",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: `Error: ${
              error instanceof Error ? error.message : "Unkown Error"
            }`,
            status: "failed",
          },
        });
      }
    } catch (dbError) {
      console.log("Failed to save error to database:", dbError);
    }
  }
}
