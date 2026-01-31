// import { client } from "@/lib/api-client";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";

// export const useAiPartners = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (communityId: string) => {
//      const res = await client.api.matches[communityId].aimatch.$post({
//   param: { communityId },
// });

//       if (!res.ok) {
//         throw new Error("Failed to find ai partner");
//       }
//       return res.json();
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({
//         queryKey: ["potentialPartners", variables],
//       });
//     },
//     onError: (error) => {
//       console.error("Error finding ai partner", error);
//     },
//   });
// };

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

// // export const useAcceptMatch = () => {
// //   const router = useRouter();
// //   const queryClient = useQueryClient();
// //   return useMutation({
// //     mutationFn: async (matchId: string) => {
// //       const res = await client.api.matches[":matchId"].accept.$put({
// //         param: { matchId },
// //       });
// //       if (!res.ok) {
// //         throw new Error("Failed to accept match");
// //       }
// //       return res.json();
// //     },
// //     onSuccess: (_, matchId) => {
// //       queryClient.invalidateQueries({
// //         queryKey: ["matches"],
// //       });
// //       router.push(`/chat/${matchId}`);
// //     },
// //     onError: (error) => {
// //       console.error("Error accepting match", error);
// //     },
// //   });
// // };

// export const useAcceptMatch = () => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (matchId: string) => {
//       const res = await client.api.matches[matchId].accept.$put({
//         param: { matchId },
//       });
//       if (!res.ok) {
//         throw new Error("Failed to accept match");
//       }
//       return res.json();
//     },
//     // onSuccess: (_, matchId) => {
//     //   queryClient.invalidateQueries({ queryKey: ["matches"] });
//     //   router.push(`/chat/${matchId}`);
//     // },
//     onSuccess: (conversation, matchId) => {
//   queryClient.setQueryData(
//     ["conversation", matchId],
//     conversation
//   );
//   queryClient.invalidateQueries({ queryKey: ["matches"] });
//   router.push(`/chat/${matchId}`);
// },

    
//     onError: (error) => console.error("Error accepting match", error),
//   }

// );


// };
import { client } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// export const useAiPartners = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (communityId: string) => {
//       const res = await client.api.matches[":communityId"].aimatch.$post({
//         param: { communityId },
//       });
//       if (!res.ok) {
//         throw new Error("Failed to find ai partner");
//       }
//       return res.json();
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({
//         queryKey: ["potentialPartners", variables],
//       });
//     },
//     onError: (error) => {
//       console.error("Error finding ai partner", error);
//     },
//   });
// };

export const useAiPartners = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      try {
        // Direct call using api client
        const data = await client.api.matches[":communityId"].aimatch.$post({
          param: { communityId },
        });
        return data; // JSON already resolved
      } catch (err: any) {
        console.error("AI Match error:", err);
        // Backend ka message agar ho to throw karo
        throw new Error(err?.message || "Failed to find AI partner");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["potentialPartners", variables],
      });
    },
    onError: (error: any) => {
      console.error("Error finding ai partner", error);
    },
  });
};

export const useMatches = () => {
  return useQuery({
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


// export const useAiPartners = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (communityId: string) => {
//       try {
//         // Direct call using api client
//         const data = await client.api.matches[":communityId"].aimatch.$post({
//           param: { communityId },
//         });
//         return data; // JSON already resolved
//       } catch (err: any) {
//         console.error("AI Match error:", err);
//         // Backend ka message agar ho to throw karo
//         throw new Error(err?.message || "Failed to find AI partner");
//       }
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({
//         queryKey: ["potentialPartners", variables],
//       });
//     },
//     onError: (error: any) => {
//       console.error("Error finding ai partner", error);
//     },
//   });
// };
