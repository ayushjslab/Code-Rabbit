"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  disconnectAllRepository,
  disconnectRepository,
  getConnectedRepositories,
} from "../actions";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Github } from "lucide-react";

const RepositoryList = () => {
  const queryClient = useQueryClient();
  const [disconnectAllOpen, setDisconnectAllOpen] = useState(false);

  const { data: repositories, isLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: async () => await getConnectedRepositories(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (repositoryId: string) =>
      await disconnectRepository(repositoryId),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success("Repository disconnected 💔");
      } else {
        toast.error(result?.error || "Failed to disconnect repository");
      }
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => await disconnectAllRepository(),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        toast.success(`Disconnected ${result.count} repositories`);
        setDisconnectAllOpen(false);
      } else {
        toast.error(result?.error || "Failed to disconnect repositories");
      }
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Manage your connected GitHub repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded-xl" />
            <div className="h-16 bg-muted rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Manage your connected GitHub repositories
          </CardDescription>
        </div>

        {repositories?.length > 0 && (
          <AlertDialog
            open={disconnectAllOpen}
            onOpenChange={setDisconnectAllOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
                Disconnect All
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Disconnect all repositories?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all connected GitHub repositories. This
                  action can’t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => disconnectAllMutation.mutate()}
                  className="bg-rose-600 hover:bg-rose-500"
                >
                  Disconnect All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {repositories?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            No repositories connected yet ✨
          </p>
        )}

        {repositories?.map((repo: any) => (
          <div
            key={repo.id}
            className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition"
          >
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-rose-600" />
              <div>
                <p className="font-medium">{repo.name}</p>
                <p className="text-sm text-muted-foreground">
                  {repo.owner}
                </p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Disconnect this repository?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This repository will no longer be synced.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disconnectMutation.mutate(repo.id)}
                    className="bg-rose-600 hover:bg-rose-500"
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RepositoryList;
