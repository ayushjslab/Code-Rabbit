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
import { Check, Infinity, Loader2, RefreshCcw, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { checkout, customer } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getSubscriptionData,
  syncSubscriptionStatus,
} from "@/module/payment/actions";
import { toast } from "sonner";

const PLAN_FEATURES = {
  free: [
    { name: "Up to 5 repositories", included: true },
    { name: "Up to 5 reviews per repository", included: true },
    { name: "Basic code reviews", included: true },
    { name: "Community support", included: true },
    { name: "Advanced analytics", included: false },
    { name: "Priority support", included: false },
  ],

  pro: [
    { name: "Unlimited repositories", included: true },
    { name: "Unlimited reviews", included: true },
    { name: "Advanced code reviews", included: true },
    { name: "Email support", included: true },
    { name: "Advanced analytics", included: true },
    { name: "Priority support", included: true },
  ],
};

const SubscriptionPage = () => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: getSubscriptionData,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (success === "true") {
      const sync = async () => {
        try {
          await syncSubscriptionStatus();
          refetch();
        } catch (error) {
          console.log(error);
        }
      };
      sync()
    }
  }, [success, refetch]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Subscription Plans</h1>
          <p>Failed to load subscription daata</p>
        </div>
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load subscription data. Please try again.
            <Button onClick={() => refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div>
        <div>
          <h1>Subscriptions Plans</h1>
          <p>Please sign in to view subscription options</p>
        </div>
      </div>
    );
  }

  const currentTier = data.user.subscriptionTier as "FREE" | "PRO";
  const isPro = currentTier === "PRO";
  const isActive = data.user.subscriptionStatus === "ACTIVE";

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      const result = await syncSubscriptionStatus();
      if (result.success) {
        toast.success("Subscription status updated");
        refetch();
      } else {
        toast.error("Failed to sync subscription");
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to initial checkout");
      setSyncLoading(true);
    }
  };

  const handleUpgrade = async () => {
    try {
      setCheckoutLoading(true);

      await checkout({
        slug: "CodeRabbit",
      });
    } catch (error) {
      console.log("Failed to indicate checkout:", error);
      setCheckoutLoading(false);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      await customer.portal();
    } catch (error) {
      console.log(error);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-6xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Choose the plan that fits your workflow
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => refetch()}
          disabled={syncLoading}
          className="flex items-center justify-center gap-2 border rounded-xl cursor-pointer"
        >
          {syncLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Sync Status
        </Button>
      </div>
      {success === "true" && (
        <Alert className="relative mx-auto mb-10 max-w-3xl overflow-hidden border-rose-800 bg-linear-to-r from-rose-950/60 via-neutral-900 to-rose-950/60 shadow-lg shadow-rose-900/30">
          {/* Glow accent */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-rose-500 to-transparent" />

          <div className="flex items-start gap-4">
            {/* Icon bubble */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600/20 ring-1 ring-rose-500/40">
              <Check className="h-5 w-5 text-rose-400" />
            </div>

            <div className="flex-1">
              <AlertTitle className="text-base font-semibold text-white">
                Subscription Updated ✨
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm text-neutral-300">
                Your plan has been successfully updated. Changes may take a few
                moments to reflect across your account.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {data.limits && (
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white">Current Usage</CardTitle>
            <CardDescription className="text-neutral-400">
              Your plan limits and real-time usage
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Repositories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">
                  Repositories
                </span>
                <Badge
                  className={`${
                    data.limits.repositories.canAdd
                      ? "bg-rose-600 text-white"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {data.limits.repositories.current} /{" "}
                  {data.limits.repositories.limit ?? <Infinity />}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    data.limits.repositories.canAdd
                      ? "bg-linear-to-r from-rose-500 to-rose-600"
                      : "bg-linear-to-r from-rose-700 to-rose-900"
                  }`}
                  style={{
                    width: data.limits.repositories.limit
                      ? `${Math.min(
                          (data.limits.repositories.current /
                            data.limits.repositories.limit) *
                            100,
                          100
                        )}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            {/* Reviews per repo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">
                  Reviews per Repository
                </span>
                <Badge className="bg-neutral-800 text-neutral-200">
                  {isPro ? "Unlimited" : "5 / repo"}
                </Badge>
              </div>

              <p className="text-xs text-neutral-400">
                {isPro
                  ? "Unlimited AI reviews with no restrictions."
                  : "Free plan allows up to 5 reviews per repository."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* FREE */}
        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For personal projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-4xl font-bold">$0</p>

            <ul className="space-y-3 text-sm">
              {PLAN_FEATURES.free.map((f) => (
                <li key={f.name} className="flex items-center gap-2">
                  {f.included ? (
                    <Check className="h-4 w-4 text-rose-500" />
                  ) : (
                    <X className="h-4 w-4 text-neutral-600" />
                  )}
                  <span
                    className={
                      f.included ? "" : "text-neutral-500 line-through"
                    }
                  >
                    {f.name}
                  </span>
                </li>
              ))}
            </ul>

            <Button variant="secondary" className="w-full" disabled={!isPro}>
              {isPro ? "Downgrade unavailable" : "Current Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* PRO */}
        <Card className="relative border-rose-800 bg-linear-to-br from-neutral-900 to-rose-950/40 shadow-lg shadow-rose-900/30">
          <div className="absolute right-4 top-4">
            <Badge className="bg-rose-600 text-white">Popular</Badge>
          </div>

          <CardHeader>
            <CardTitle className="text-rose-400">Pro</CardTitle>
            <CardDescription>For teams & serious devs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-4xl font-bold">
              $29 <span className="text-sm text-neutral-400">/ month</span>
            </p>

            <ul className="space-y-3 text-sm">
              {PLAN_FEATURES.pro.map((f) => (
                <li key={f.name} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-rose-500" />
                  {f.name}
                </li>
              ))}
            </ul>

            {isPro && isActive ? (
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full bg-neutral-800 hover:bg-neutral-700"
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Manage Subscription"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="w-full bg-rose-600 hover:bg-rose-700"
              >
                {checkoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;
