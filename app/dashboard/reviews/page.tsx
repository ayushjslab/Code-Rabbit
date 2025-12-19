"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getReviews } from "@/module/reviews/actions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Github } from "lucide-react";

const ReviewsPage = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      return await getReviews();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-900 border-t-rose-500"></div>
          <p className="text-sm font-medium text-rose-400">Loading reviews…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Review History
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                All AI-generated pull request reviews in one place
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-rose-950 px-4 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-rose-500"></div>
              <span className="text-sm font-semibold text-rose-400">
                {reviews?.length || 0} Reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {reviews?.length === 0 ? (
            <Card className="border-2 border-dashed border-rose-900 bg-neutral-900/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-rose-950 p-4">
                  <svg
                    className="h-12 w-12 text-rose-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-white">
                  No reviews yet
                </p>
                <p className="mt-2 max-w-sm text-sm text-neutral-400">
                  Connect a repository and open a pull request to get your first
                  AI-powered code review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {reviews.map((review: any) => (
                <Card
                  key={review.id}
                  className="group border-neutral-800 bg-neutral-900 transition-all hover:border-rose-800 hover:shadow-lg hover:shadow-rose-900/30"
                >
                  <CardHeader className="border-b border-neutral-800 bg-linear-to-r from-rose-950/40 to-transparent pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-rose-400">
                        <Github />
                        <span className="truncate">
                          {review.repository?.fullName}
                        </span>
                      </div>
                      <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
                        {review.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={review.prUrl}
                        target="_blank"
                        className="text-xl font-bold text-white transition group-hover:text-rose-400"
                      >
                        {review.prTitle}
                      </Link>
                      <p className="mt-1 flex items-center gap-2 text-sm text-neutral-400">
                        <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs">
                          #{review.prNumber}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-5">
                    <div className="max-h-80 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-inner">
                      <MarkdownPreview
                        source={review.review}
                        className="bg-transparent!"
                        data-color-mode="dark"
                        style={{
                          color: "#e5e7eb",
                          padding: 0,
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        href={review.prUrl}
                        target="_blank"
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        View on GitHub →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
