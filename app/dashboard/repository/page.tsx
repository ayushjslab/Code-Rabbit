"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RepositoryListSkeleton } from "@/module/repository/components/repository-list-skeleton";
import { useConnectRepository } from "@/module/repository/hooks/use-connect-repository";
import { useRepositories } from "@/module/repository/hooks/use-repositories";
import { ExternalLink, Search, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepositoryPage = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const { mutate: connectRepo } = useConnectRepository();

  const [searchQuery, setSearchQuery] = useState("");
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null
  );
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("hello here");

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(target); // ✅ THIS WAS MISSING

    return () => {
      observer.unobserve(target); // cleanup
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allRepositories: Repository[] =
    data?.pages.flatMap((page) => page) ?? [];

  const filteredRepositories = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allRepositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(q) ||
        repo.full_name.toLowerCase().includes(q)
    );
  }, [allRepositories, searchQuery]);

  const handleConnect = (repo: Repository) => {
    setLocalConnectingId(repo.id);
    connectRepo(
      {
        owner: repo.full_name.split("/")[0],
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSettled: () => setLocalConnectingId(null),
      }
    );
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading repositories…</div>;
  }

  if (isError) {
    return (
      <div className="text-destructive">
        Something went wrong. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Repositories</h1>
        <p className="text-sm text-muted-foreground">
          Manage and explore all your GitHub repositories
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories…"
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Repository list */}
      <div className="grid gap-4">
        {filteredRepositories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No repositories found.
          </p>
        )}

        {filteredRepositories.map((repo) => (
          <Card key={repo.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {repo.name}
                    {repo.isConnected && (
                      <Badge variant="secondary">Connected</Badge>
                    )}
                  </CardTitle>

                  <CardDescription>
                    {repo.description || "No description provided."}
                  </CardDescription>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Badge variant="outline">
                      {repo.language ?? "Unknown"}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      {repo.stargazers_count}
                    </Badge>

                    {repo.topics?.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>

                  <Button
                    onClick={() => handleConnect(repo)}
                    disabled={localConnectingId === repo.id || repo.isConnected}
                  >
                    {localConnectingId === repo.id
                      ? "Connecting..."
                      : repo.isConnected
                      ? "Connected"
                      : "Connect"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent />
          </Card>
        ))}
        <div ref={observerTarget} className="h-4 w-full">
          {isFetchingNextPage && <RepositoryListSkeleton />}
          {!hasNextPage && allRepositories.length > 0 && (
            <p className="text-sm text-muted-foreground">
              No more repositories
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositoryPage;
