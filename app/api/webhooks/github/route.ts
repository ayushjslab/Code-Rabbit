import { reviewPullRequest } from "@/module/ai/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");

    if (event === "ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }

   if (event === "pull_request") {
  const action = body.action;
  const repo = body.repository.full_name;
  const prNumber = body.number;

  const [owner, repoName] = repo.split("/");

  if (action === "opened" || action === "synchronize") {
    try {
      await reviewPullRequest(owner, repoName, prNumber);
      console.log(`Review completed for ${repo} #${prNumber}`);
    } catch (error) {
      console.log("Review failed", error);
    }
  }
}

    //TODO Handle later

    return NextResponse.json({ message: "Event Processes" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
