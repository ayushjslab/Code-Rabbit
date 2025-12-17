import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RepositoryListSkeletonProps {
  count?: 1 | 2;
}

export const RepositoryListSkeleton = ({
  count = 2,
}: RepositoryListSkeletonProps) => {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-40">
          <CardHeader className="py-1">
            <div className="flex items-start justify-between gap-4">
              {/* Left */}
              <div className="flex-1 space-y-1.5">
                {/* Title row */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>

                {/* Description */}
                <Skeleton className="h-4 w-full max-w-lg" />
                <Skeleton className="h-4 w-3/4 max-w-md" />

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </CardHeader>

          {/* Empty content to match real card spacing */}
          <CardContent className="py-2" />
        </Card>
      ))}
    </div>
  );
};
