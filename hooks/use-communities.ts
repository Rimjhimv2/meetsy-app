import { client } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCommunities = () => {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await client.api.communities.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch communities");
      }
      return res.json();
    },
  });
};

export const useAllCommunities = () => {
  return useQuery({
    queryKey: ["allCommunities"],
    queryFn: async () => {
      const res = await client.api.communities.all.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch all communities");
      }
      return res.json();
    },
  });
};

export const useCommunityGoals = (communityId: string | null) => {
  return useQuery({
    queryKey: ["communityGoals", communityId],
    queryFn: async () => {
      const res = await client.api.communities[":communityId"].goals.$get({
        param: { communityId: communityId! },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch community goals");
      }
      return res.json();
    },
    enabled: !!communityId,
  });
};

// export const useJoinCommunity = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (communityId: string) => {
//       const res = await client.api.communities[":communityId"].join.$post({
//         param: { communityId: communityId },
//       });
//       if (!res.ok) {
//         throw new Error("Failed to join community");
//       }
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["communities"] });
//     },
//     onError: (error) => {
//       console.error("Error joining community", error);
//     },
//   });
// };

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      const res = await client.api.communities[":communityId"].join.$post({
        param: { communityId },
      });

      // 👇 400 but already joined → treat as success
      if (!res.ok) {
        const data = await res.json();

        if (data?.error === "User already joined community") {
          return data; // ✅ swallow error
        }

        throw new Error("Failed to join community");
      }

      return res.json();
    },

    onSuccess: () => {
      // 👇 refresh joined communities
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities"] });
    },

    onError: (error) => {
      console.error("Join community error:", error);
    },
  });
};
