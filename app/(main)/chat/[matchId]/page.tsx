"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chat/chat-interface";

export default function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);

  console.log("CHAT MATCH ID:", matchId);

  return (
    <div className="page-wrapper">
      <div className="mb-4">
        <Link href="/chat">
          <Button variant="outline">
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Conversations
          </Button>
        </Link>
      </div>

      <ChatInterface matchId={matchId} />
    </div>
  );
}
