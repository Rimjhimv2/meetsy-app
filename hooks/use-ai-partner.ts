
import { client } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export const useAiPartners = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      try {
        const data =
          await client.api.matches[":communityId"].aimatch.$post({
            param: { communityId },
          });
        return data;
      } 
      
      catch (err: unknown) {
  console.error("AI Match error:", err);

  if (err instanceof Error) {
    throw new Error(err.message);
  }

  throw new Error("Failed to find AI partner");
}



    },

    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["matches"] });
},

    onError: (error: unknown) => {
      console.error("Error finding ai partner", error);
    },
  });
};


// export const useMatches = () => {
//   return useQuery({
//     queryKey: ["matches"],
//     queryFn: async () => {
//       const res = await client.api.matches["allmatches"].$get();

//       if (!res.ok) {
//         throw new Error("Failed to fetch potential matches");
//       }
//       return res.json();
//     },
//   });
// };
export const useMatches = () => {
  return useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const res = await client.api.matches["allmatches"].$get();

      if (!res.ok) {
        throw new Error("Failed to fetch potential matches");
      }

      return res.json();
    },
  });
};


export const useAcceptMatch = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => {
      // $put already JSON return karta hai, res.ok check mat karo
      return await client.api.matches[":matchId"].accept.$put({
        param: { matchId },
      });
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      router.push(`/chat/${matchId}`);
    },
    onError: (error) => {
      console.error("Error accepting match", error);
      toast.error("Failed to accept match");
    },
  });
};



export interface MatchUserGoal {
  title: string;
}

export interface MatchPartner {
  id: string; 
  name: string;
  imageUrl?: string | null;
}


export interface MatchCommunity {
  id: string;
  name: string;
}
export interface Match {
  id: string;
  status: "pending" | "accepted";
  partner: MatchPartner;
  userGoals?: MatchUserGoal[];
  partnerGoals?: MatchUserGoal[]; // ✅ ADD
  community?: MatchCommunity; 
}


