import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexReop } from "@/inngest/functions";
import { generateReview } from "@/inngest/functions/review";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [indexReop, generateReview],
});
