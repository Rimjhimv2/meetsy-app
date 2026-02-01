

"use client";

import AddLearningGoal from "@/components/communities/add-learning-goal";
import AIMatching from "@/components/communities/ai-matching";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCommunities, useCommunityGoals, useJoinCommunity } from "@/hooks/use-communities";
import { useCurrentUser } from "@/hooks/use-users";
import { LockIcon, CheckIcon } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { toast } from "sonner";

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState<"goals" | "matches">("goals");
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const { data: communities } = useCommunities();
  const { data: communityGoals } = useCommunityGoals(selectedCommunity);
  const { data: user } = useCurrentUser();
  const isPro = user?.isPro;
  const showLockIcon = (communities?.length || 0) >= 3 && !isPro;

  const joinCommunityMutation = useJoinCommunity();

  // Automatically select and join the first community safely
  useEffect(() => {
    if (!communities || !user || communities.length === 0) return;

    const firstCommunity = communities[0];

//     const joinFirstCommunity = async () => {
//       try {
//         if (!firstCommunity.joinedAt) {
//  {
//           await joinCommunityMutation.mutateAsync(firstCommunity.community.id);
//           toast.success("Joined community successfully");
//         }
//       } catch (error: any) {
//         // Ignore "already joined" error
//         if (!error.message.includes("already joined")) {
//           toast.error("Failed to join community");
//         }
//       } finally {
//         startTransition(() => {
//           setSelectedCommunity(firstCommunity.community.id);
//         });
//       }
//     };
const joinFirstCommunity = async () => {
  try {
    if (!firstCommunity.joinedAt) {
      await joinCommunityMutation.mutateAsync(firstCommunity.community.id);
      toast.success("Joined community successfully");
    }
  }
  //  catch (error: unknown) {
  //   if (!error.message?.includes("already joined")) {
  //     toast.error("Failed to join community");
  //   }
  // }
  catch (error: unknown) {
  if (error instanceof Error) {
    if (!error.message.includes("already joined")) {
      toast.error("Failed to join community");
    }
  } else {
    toast.error("Failed to join community");
  }
}

   finally {
    startTransition(() => {
      setSelectedCommunity(firstCommunity.community.id);
    });
  }
};


    joinFirstCommunity();
  }, [communities, user]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showLockIcon && <LockIcon className="size-4 text-muted-foreground" />}
            Communities
          </CardTitle>
          <CardDescription>{communities?.length} joined</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {communities?.map((c) => (
            <div key={c.community.id} className="flex items-center gap-2">
              <Button
                className="w-full justify-start"
                onClick={() => setSelectedCommunity(c.community.id)}
                variant={selectedCommunity === c.community.id ? "default" : "outline"}
              >
                {c.community.name}
              </Button>
              {c.joinedAt && <CheckIcon className="text-green-500" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setActiveTab("goals")}
              variant={activeTab === "goals" ? "default" : "outline"}
            >
              My Goals
            </Button>
            <Button
              onClick={() => setActiveTab("matches")}
              variant={activeTab === "matches" ? "default" : "outline"}
            >
              Find Partners with AI
            </Button>
          </div>
          <CardTitle>
            {activeTab === "goals" ? "Learning Goals" : "Potential Learning Partners"}
          </CardTitle>
          <CardDescription>
            {activeTab === "goals"
              ? `${communityGoals?.length} ${communityGoals?.length === 1 ? "goal" : "goals"} in selected community`
              : "Members with similar learning goals"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === "goals" ? (
            <div className="space-y-2">
              {communityGoals?.map((c) => (
                <Card key={c.id} className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">{c.title}</CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
              <AddLearningGoal
                selectedCommunityId={selectedCommunity!}
                showLockIcon={showLockIcon}
              />
            </div>
          ) : (
            <AIMatching
              totalGoals={communityGoals?.length || 0}
              selectedCommunityId={selectedCommunity!}
              showLockIcon={showLockIcon}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
