"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchRepositories } from "../actions"

const PER_PAGE = 10;

export const useRepositories = () => {
  return useInfiniteQuery({
    queryKey: ["repositories"],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchRepositories(pageParam, 10)
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PER_PAGE) return undefined;
      return allPages.length + 1
    },
    initialPageParam: 1,
  })
}
