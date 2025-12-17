"use client";

import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getContributionStats } from "../actions";

const ContributionGraph = () => {
  const { theme } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["contribution-graph"],
    queryFn: async () => await getContributionStats(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading contribution activity…
      </div>
    );
  }

  if (!data || !data.contributions.length) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No contribution data available
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl py-6 shadow-sm transition">
     
      {/* Calendar */}
      <div className="overflow-x-auto">
        <ActivityCalendar
          data={data.contributions}
          colorScheme={theme === "dark" ? "dark" : "light"}
          blockSize={12}
          blockMargin={4}
          fontSize={13}
          showMonthLabels
          showWeekdayLabels
          theme={{
            light: [
              "hsl(0, 0%, 92%)",
              "hsl(352, 100%, 90%)",
              "hsl(352, 96%, 78%)",
              "hsl(352, 90%, 65%)",
              "hsl(352, 85%, 55%)",
            ],
            dark: [
              "#161b22",
              "hsl(352, 80%, 35%)",
              "hsl(352, 85%, 45%)",
              "hsl(352, 90%, 55%)",
              "hsl(352, 95%, 65%)",
            ],
          }}
        />
      </div>
    </div>
  );
};

export default ContributionGraph;
