"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../actions";
import { toast } from "sonner";
import { User, Mail, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileForm = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => await getUserProfile(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) =>
      await updateUserProfile(data),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        toast.success("Profile updated 💗");
      }
    },
    onError: () => toast.error("Update failed 💔"),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, email });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-rose-500">
        Loading your glow…
      </div>
    );
  }

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-2xl">
          Profile Details
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-rose-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-rose-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-white font-medium shadow-md transition disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
