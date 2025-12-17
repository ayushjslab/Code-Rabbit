"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  MessageSquare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getMonthlyActivity,
} from "@/module/dashboard/actions";
import ContributionGraph from "@/module/dashboard/components/contribution-graph";

const MainPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  });
  const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: async () => await getMonthlyActivity(),
    refetchOnWindowFocus: false,
  });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your coding activity and AI reviews
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Repositories
            </CardTitle>
            <GitBranch className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : (stats?.totalRepos || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected repositories
            </p>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commits
            </CardTitle>
            <GitCommit className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : (stats?.totalCommits || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In the last year
            </p>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pull Requests
            </CardTitle>
            <GitPullRequest className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : (stats?.totalPRs || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="transition hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Reviews
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : (stats?.totalReviews || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generated reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contribution activity</CardTitle>
          <CardDescription>
            Visualizing your coding frequency over the last year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionGraph />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>
              Monthly breakdown of activity, PRs, and reviews (last 6 months)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                Loading activity…
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyActivity}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--background))",
                        fontSize: 12,
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                        paddingTop: 10,
                      }}
                    />

                    <Bar
                      dataKey="activity"
                      name="Activity"
                      stackId="a"
                      fill="hsl(352, 85%, 55%)" // rose
                    />

                    <Bar
                      dataKey="prs"
                      name="Pull Requests"
                      stackId="a"
                      fill="hsl(160, 70%, 45%)" // emerald
                    />

                    <Bar
                      dataKey="reviews"
                      name="Reviews"
                      stackId="a"
                      fill="hsl(221, 83%, 60%)" // indigo
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainPage;
