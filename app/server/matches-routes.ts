// import { Hono } from "hono";
// import { authMiddleware } from "./middleware/auth-middleware";
// import { aiMatchUsers } from "@/lib/ai";
// import {
//   findMatchesByUserId,
//   getGoalsByUserAndCommunity,
//   getGoalsByUsersAndCommunity,
//   getPartnerUserId,
//   getUserMatches,
//   getUsersByIds,
// } from "@/lib/db-helpers";
// import { db } from "@/db";
// import {
//   communities,
//   conversations,
//   learningGoals,
//   matches,
//   users,
// } from "@/db/schema";
// import { eq, inArray } from "drizzle-orm";
// import { HTTPException } from "hono/http-exception";

// type Variables = {
//   userId: string;
// };
// const matchesApp = new Hono<{ Variables: Variables }>()
//   .use("/*", authMiddleware)

//   // ✅ 1️⃣ STATIC ROUTE FIRST (VERY IMPORTANT)
//   .get("/allmatches", async (c) => {
//     const user = c.get("user");

//     const myMatches = await getUserMatches(user.id);

//     const partnerIds = myMatches.map((match) =>
//       getPartnerUserId(match, user.id)
//     );

//     const communitiesSet = new Set(myMatches.map((m) => m.communityId));
//     const communityIdsArray = Array.from(communitiesSet);

//     const [partnersMap, communitiesMap, ...allGoalsMaps] = await Promise.all([
//       getUsersByIds(partnerIds),
//       (async () => {
//         if (communityIdsArray.length === 0) return new Map();
//         const communitiesList = await db
//           .select()
//           .from(communities)
//           .where(inArray(communities.id, communityIdsArray));
//         return new Map(communitiesList.map((c) => [c.id, c]));
//       })(),
//       ...communityIdsArray.map((communityId) =>
//         getGoalsByUsersAndCommunity(partnerIds, communityId)
//       ),
//       ...communityIdsArray.map((communityId) =>
//         getGoalsByUserAndCommunity(user.id, communityId)
//       ),
//     ]);

//     const mergedPartnerGoalsMap = new Map<
//       string,
//       (typeof learningGoals.$inferSelect)[]
//     >();

//     const partnerGoalsMaps = allGoalsMaps.slice(
//       0,
//       communityIdsArray.length
//     ) as Map<string, (typeof learningGoals.$inferSelect)[]>[];

//     for (const goalsMap of partnerGoalsMaps) {
//       for (const [userId, goals] of goalsMap.entries()) {
//         if (!mergedPartnerGoalsMap.has(userId)) {
//           mergedPartnerGoalsMap.set(userId, []);
//         }
//         mergedPartnerGoalsMap.get(userId)!.push(...goals);
//       }
//     }

//     const userGoalsMaps = allGoalsMaps.slice(
//       communityIdsArray.length
//     ) as (typeof learningGoals.$inferSelect)[][];

//     const userGoalsByCommunity = new Map<
//       string,
//       (typeof learningGoals.$inferSelect)[]
//     >();

//     for (let i = 0; i < communityIdsArray.length; i++) {
//       userGoalsByCommunity.set(communityIdsArray[i], userGoalsMaps[i] || []);
//     }

//     const enrichedMatches = myMatches.map((match) => {
//       const partnerId = getPartnerUserId(match, user.id);
//       const partner = partnersMap.get(partnerId);
//       const community = communitiesMap.get(match.communityId);

//       return {
//         ...match,
//         partner: {
//           id: partner?.id || partnerId,
//           name: partner?.name || "Unknown User",
//           imageUrl: partner?.imageUrl || null,
//         },
//         community: community
//           ? {
//               id: community.id,
//               name: community.name,
//               description: community.description,
//               imageUrl: community.imageUrl,
//             }
//           : null,
//       };
//     });

//     return c.json(enrichedMatches);
//   })

//   // ✅ 2️⃣ COMMUNITY ROUTES
//   .post("/:communityId/aimatch", async (c) => {
//     const user = c.get("user");
//     const communityId = c.req.param("communityId");
//     return c.json(await aiMatchUsers(user, communityId));
//   })

//   .get("/:communityId/matches", async (c) => {
//     const user = c.get("user");
//     const communityId = c.req.param("communityId");

//     const potentialMatches = await findMatchesByUserId(user.id, communityId);

//     const enrichedMatches = await Promise.all(
//       potentialMatches.map(async (match) => {
//         const [matchUser] = await db
//           .select()
//           .from(users)
//           .where(eq(users.id, match.userId));

//         return {
//           ...match,
//           name: matchUser?.name || "Unknown",
//           imageUrl: matchUser?.imageUrl,
//         };
//       })
//     );

//     return c.json(enrichedMatches);
//   })

//   // ✅ 3️⃣ MATCH ROUTES
//   .put("/:matchId/accept", async (c) => {
//     const matchId = c.req.param("matchId");

//     const [match] = await db
//       .update(matches)
//       .set({ status: "accepted" })
//       .where(eq(matches.id, matchId))
//       .returning();

//     if (!match) {
//       throw new HTTPException(404, { message: "Match not found" });
//     }

//     let [conversation] = await db
//       .select()
//       .from(conversations)
//       .where(eq(conversations.matchId, match.id));

//     if (!conversation) {
//       [conversation] = await db
//         .insert(conversations)
//         .values({ matchId: match.id })
//         .returning();
//     }

//     // 🔥 FRONTEND UNBLOCK
//     return c.json({
//       matchId: match.id,
//       conversationId: conversation.id,
//     });
//   })

//   .get("/:matchId/conversation", async (c) => {
//     const matchId = c.req.param("matchId");
//     const user = c.get("user");

//     const [match] = await db
//       .select()
//       .from(matches)
//       .where(eq(matches.id, matchId));

//     if (!match) throw new HTTPException(404, { message: "Match not found" });

//     const otherUserId =
//       match.user1Id === user.id ? match.user2Id : match.user1Id;

//     const [otherUser] = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, otherUserId));

//     let [conversation] = await db
//       .select()
//       .from(conversations)
//       .where(eq(conversations.matchId, matchId));

//     if (!conversation) {
//       [conversation] = await db
//         .insert(conversations)
//         .values({ matchId })
//         .returning();
//     }

//     return c.json({
//       ...conversation,
//       status: match.status,
//       currentUserId: user.id,
//       otherUser: {
//         id: otherUser.id,
//         name: otherUser.name,
//         imageUrl: otherUser.imageUrl,
//       },
//     });
//   });
// export default matchesApp;


// import { Hono } from "hono";
// import { authMiddleware } from "./middleware/auth-middleware";
// import { aiMatchUsers } from "@/lib/ai";
// import {
//   findMatchesByUserId,
//   getGoalsByUserAndCommunity,
//   getGoalsByUsersAndCommunity,
//   getPartnerUserId,
//   getUserMatches,
//   getUsersByIds,
// } from "@/lib/db-helpers";
// import { db } from "@/db";
// import {
//   communities,
//   conversations,
//   learningGoals,
//   matches,
//   users,
// } from "@/db/schema";
// import { eq, inArray } from "drizzle-orm";
// import { HTTPException } from "hono/http-exception";

// type Variables = {
//   userId: string;
// };

// const matchesApp = new Hono<{ Variables: Variables }>()
//   .use("/*", authMiddleware)
//   .post("/:communityId/aimatch", async (c) => {
//     const user = c.get("user");
//     const communityId = c.req.param("communityId");

//     const aiMatch = await aiMatchUsers(user, communityId);
//     return c.json(aiMatch);
//   })
//   .get("/:communityId/matches", async (c) => {
//     const user = c.get("user");
//     const communityId = c.req.param("communityId");
//     const potentialMatches = await findMatchesByUserId(user.id, communityId);

//     const enrichedMatches = await Promise.all(
//       potentialMatches.map(async (match) => {
//         const [matchUser] = await db
//           .select()
//           .from(users)
//           .where(eq(users.id, match.userId));
//         return {
//           ...match,
//           name: matchUser?.name || "Unknown",
//           imageUrl: matchUser?.imageUrl,
//         };
//       })
//     );

//     return c.json(enrichedMatches);
//     // 1️⃣ Pending matches (NO dedupe)





//   })
//   .get("/allmatches", async (c) => {
//     const user = c.get("user");
//     console.log("🔥 USER ID:", user.id);

//     const myMatches = await getUserMatches(user.id);

//     // Batch fetch all partner users and their goals (N+1 fix!)
//     const partnerIds = myMatches.map((match) =>
//       getPartnerUserId(match, user.id)
//     );

//     // If matches span multiple communities, fetch goals for each community
//     const communitiesSet = new Set(myMatches.map((m) => m.communityId));
//     const communityIdsArray = Array.from(communitiesSet);

//     const [partnersMap, communitiesMap, ...allGoalsMaps] = await Promise.all([
//       getUsersByIds(partnerIds),
//       // Fetch all communities
//       (async () => {
//         if (communityIdsArray.length === 0) return new Map();
//         const communitiesList = await db
//           .select()
//           .from(communities)
//           .where(inArray(communities.id, communityIdsArray));
//         return new Map(communitiesList.map((c) => [c.id, c]));
//       })(),
//       // Fetch partner goals for each community
//       ...communityIdsArray.map((communityId) =>
//         getGoalsByUsersAndCommunity(partnerIds, communityId)
//       ),
//       // Fetch user's own goals for each community
//       ...communityIdsArray.map((communityId) =>
//         getGoalsByUserAndCommunity(user.id, communityId)
//       ),
//     ]);

//     // Merge all partner goals maps
//     const mergedPartnerGoalsMap = new Map<
//       string,
//       (typeof learningGoals.$inferSelect)[]
//     >();
//     const partnerGoalsMaps = allGoalsMaps.slice(
//       0,
//       communityIdsArray.length
//     ) as Map<string, (typeof learningGoals.$inferSelect)[]>[];
//     for (const goalsMap of partnerGoalsMaps) {
//       for (const [userId, goals] of goalsMap.entries()) {
//         if (!mergedPartnerGoalsMap.has(userId)) {
//           mergedPartnerGoalsMap.set(userId, []);
//         }
//         mergedPartnerGoalsMap.get(userId)!.push(...goals);
//       }
//     }

//     // Store user's own goals by community
//     const userGoalsMaps = allGoalsMaps.slice(
//       communityIdsArray.length
//     ) as (typeof learningGoals.$inferSelect)[][];
//     const userGoalsByCommunity = new Map<
//       string,
//       (typeof learningGoals.$inferSelect)[]
//     >();
//     for (let i = 0; i < communityIdsArray.length; i++) {
//       const communityId = communityIdsArray[i];
//       const goals = userGoalsMaps[i] || [];
//       userGoalsByCommunity.set(communityId, goals);
//     }

//     // Enrich matches with partner information, community info, and goals
//     const enrichedMatches = myMatches.map((match) => {
//       const partnerId = getPartnerUserId(match, user.id);
//       const partner = partnersMap.get(partnerId);
//       const allPartnerGoals = mergedPartnerGoalsMap.get(partnerId) || [];
//       const community = communitiesMap.get(match.communityId);
//       const userGoals = userGoalsByCommunity.get(match.communityId) || [];

//       // Filter goals for this specific community
//       const partnerGoals = allPartnerGoals
//         .filter((g) => g.communityId === match.communityId)
//         .map((g) => ({
//           id: g.id,
//           title: g.title,
//           description: g.description,
//         }));

//       const userGoalsForMatch = userGoals.map((g) => ({
//         id: g.id,
//         title: g.title,
//         description: g.description,
//       }));

//       return {
//         ...match,
//         partner: {
//           id: partner?.id || partnerId,
//           name: partner?.name || "Unknown User",
//           imageUrl: partner?.imageUrl || null,
//         },
//         community: community
//           ? {
//               id: community.id,
//               name: community.name,
//               description: community.description,
//               imageUrl: community.imageUrl,
//             }
//           : null,
//         partnerGoals,
//         userGoals: userGoalsForMatch,
//       };
//     });

//     return c.json(enrichedMatches);
//   })
//   .put("/:matchId/accept", async (c) => {
//     const matchId = c.req.param("matchId");

//     const [match] = await db
//       .update(matches)
//       .set({ status: "accepted" })
//       .where(eq(matches.id, matchId))
//       .returning();

//     if (!match) {
//       throw new HTTPException(404, { message: "Match not found" });
//     }

//     await db.insert(conversations).values({
//       matchId: match.id,
//     });

//     return c.json(match);
//   })
//   .get("/:matchId/conversation", async (c) => {
//     const matchId = c.req.param("matchId");
//     const user = c.get("user");

//     //verify match exists
//     const [match] = await db
//       .select()
//       .from(matches)
//       .where(eq(matches.id, matchId));

//     if (!match) {
//       throw new HTTPException(404, { message: "Match not found" });
//     }

//     //get the other user's id
//     const otherUserId =
//       match.user1Id === user.id ? match.user2Id : match.user1Id;

//     //fetch the other user's details
//     const [otherUser] = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, otherUserId));

//     if (!otherUser) {
//       throw new HTTPException(404, { message: "User not found" });
//     }

//     //check if conversation exists

//     let [conversation] = await db
//       .select()
//       .from(conversations)
//       .where(eq(conversations.matchId, matchId));

//     if (!conversation) {
//       [conversation] = await db
//         .insert(conversations)
//         .values({
//           matchId: matchId,
//         })
//         .returning();
//     }

//     return c.json({
//       ...conversation,
//       status: match.status,
//       currentUserId: user.id,
//       otherUser: {
//         id: otherUser.id || otherUserId,
//         name: otherUser.name || "Unknown User",
//         imageUrl: otherUser.imageUrl || null,
//       },
//     });
//   });

// export { matchesApp };

import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth-middleware";
import { aiMatchUsers } from "@/lib/ai";
import {
  findMatchesByUserId,
  getGoalsByUserAndCommunity,
  getGoalsByUsersAndCommunity,
  getPartnerUserId,
  getUserMatches,
  getUsersByIds,
} from "@/lib/db-helpers";
import { db } from "@/db";
import {
  communities,
  conversations,
  learningGoals,
  matches,
  users,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

type Variables = {
  userId: string;
};

const matchesApp = new Hono<{ Variables: Variables }>()
  .use("/*", authMiddleware)
  .post("/:communityId/aimatch", async (c) => {
    const user = c.get("user");
    const communityId = c.req.param("communityId");

    const aiMatch = await aiMatchUsers(user, communityId);
    return c.json(aiMatch);
  })
  .get("/:communityId/matches", async (c) => {
    const user = c.get("user");
    const communityId = c.req.param("communityId");
    const potentialMatches = await findMatchesByUserId(user.id, communityId);

    const enrichedMatches = await Promise.all(
      potentialMatches.map(async (match) => {
        const [matchUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, match.userId));
        return {
          ...match,
          name: matchUser?.name || "Unknown",
          imageUrl: matchUser?.imageUrl,
        };
      })
    );

    return c.json(enrichedMatches);
  })
  .get("/allmatches", async (c) => {
    const user = c.get("user");

    const myMatches = await getUserMatches(user.id);

    // Batch fetch all partner users and their goals (N+1 fix!)
    const partnerIds = myMatches.map((match) =>
      getPartnerUserId(match, user.id)
    );

    // If matches span multiple communities, fetch goals for each community
    const communitiesSet = new Set(myMatches.map((m) => m.communityId));
    const communityIdsArray = Array.from(communitiesSet);

    const [partnersMap, communitiesMap, ...allGoalsMaps] = await Promise.all([
      getUsersByIds(partnerIds),
      // Fetch all communities
      (async () => {
        if (communityIdsArray.length === 0) return new Map();
        const communitiesList = await db
          .select()
          .from(communities)
          .where(inArray(communities.id, communityIdsArray));
        return new Map(communitiesList.map((c) => [c.id, c]));
      })(),
      // Fetch partner goals for each community
      ...communityIdsArray.map((communityId) =>
        getGoalsByUsersAndCommunity(partnerIds, communityId)
      ),
      // Fetch user's own goals for each community
      ...communityIdsArray.map((communityId) =>
        getGoalsByUserAndCommunity(user.id, communityId)
      ),
    ]);

    // Merge all partner goals maps
    const mergedPartnerGoalsMap = new Map<
      string,
      (typeof learningGoals.$inferSelect)[]
    >();
    const partnerGoalsMaps = allGoalsMaps.slice(
      0,
      communityIdsArray.length
    ) as Map<string, (typeof learningGoals.$inferSelect)[]>[];
    for (const goalsMap of partnerGoalsMaps) {
      for (const [userId, goals] of goalsMap.entries()) {
        if (!mergedPartnerGoalsMap.has(userId)) {
          mergedPartnerGoalsMap.set(userId, []);
        }
        mergedPartnerGoalsMap.get(userId)!.push(...goals);
      }
    }

    // Store user's own goals by community
    const userGoalsMaps = allGoalsMaps.slice(
      communityIdsArray.length
    ) as (typeof learningGoals.$inferSelect)[][];
    const userGoalsByCommunity = new Map<
      string,
      (typeof learningGoals.$inferSelect)[]
    >();
    for (let i = 0; i < communityIdsArray.length; i++) {
      const communityId = communityIdsArray[i];
      const goals = userGoalsMaps[i] || [];
      userGoalsByCommunity.set(communityId, goals);
    }

    // Enrich matches with partner information, community info, and goals
    const enrichedMatches = myMatches.map((match) => {
      const partnerId = getPartnerUserId(match, user.id);
      const partner = partnersMap.get(partnerId);
      const allPartnerGoals = mergedPartnerGoalsMap.get(partnerId) || [];
      const community = communitiesMap.get(match.communityId);
      const userGoals = userGoalsByCommunity.get(match.communityId) || [];

      // Filter goals for this specific community
      const partnerGoals = allPartnerGoals
        .filter((g) => g.communityId === match.communityId)
        .map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description,
        }));

      const userGoalsForMatch = userGoals.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
      }));

      return {
        ...match,
        partner: {
          id: partner?.id || partnerId,
          name: partner?.name || "Unknown User",
          imageUrl: partner?.imageUrl || null,
        },
        community: community
          ? {
              id: community.id,
              name: community.name,
              description: community.description,
              imageUrl: community.imageUrl,
            }
          : null,
        partnerGoals,
        userGoals: userGoalsForMatch,
      };
    });

   
// const activeMatches = enrichedMatches
//   .filter(
//     (match) => match.status === "accepted" || match.status === "pending"
//   )
//   .sort((a, b) => {
//     // 🔥 pending ko pehle lao
//     if (a.status === "pending" && b.status === "accepted") return -1;
//     if (a.status === "accepted" && b.status === "pending") return 1;
//     return 0;
//   });


// const uniqueMatchesMap = new Map<string, any>();

// for (const match of activeMatches) {
//   const partnerId = getPartnerUserId(match, user.id);

//   // pehla hi store hoga → accepted jeet jaayega
//   if (!uniqueMatchesMap.has(partnerId)) {
//     uniqueMatchesMap.set(partnerId, match);
//   }
// }

// const uniqueActiveChats = Array.from(uniqueMatchesMap.values());

// return c.json(uniqueActiveChats);
//   return c.json(uniqueActiveChats);
// })   // ✅ YE MISSING THA

// 1️⃣ Pending matches → NO dedupe
const pendingMatches = enrichedMatches.filter(
  (match) => match.status === "pending"
);

// 2️⃣ Accepted matches → dedupe by partner
const acceptedMatches = enrichedMatches.filter(
  (match) => match.status === "accepted"
);

const uniqueAcceptedMap = new Map<string, any>();

for (const match of acceptedMatches) {
  const partnerId = getPartnerUserId(match, user.id);

  if (!uniqueAcceptedMap.has(partnerId)) {
    uniqueAcceptedMap.set(partnerId, match);
  }
}

// 3️⃣ Final response
return c.json([
  ...pendingMatches,
  ...Array.from(uniqueAcceptedMap.values()),
]);

})


.put("/:matchId/accept", async (c) => {
  const matchId = c.req.param("matchId");

  const [match] = await db
    .update(matches)
    .set({ status: "accepted" })
    .where(eq(matches.id, matchId))
    .returning();

  if (!match) {
    throw new HTTPException(404, { message: "Match not found" });
  }

  return c.json(match);
})


  .get("/:matchId/conversation", async (c) => {
    const matchId = c.req.param("matchId");
    const user = c.get("user");

    //verify match exists
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));

    if (!match) {
      throw new HTTPException(404, { message: "Match not found" });
    }

    //get the other user's id
    const otherUserId =
      match.user1Id === user.id ? match.user2Id : match.user1Id;

    //fetch the other user's details
    const [otherUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, otherUserId));

    if (!otherUser) {
      throw new HTTPException(404, { message: "User not found" });
    }

   
let [conversation] = await db
  .select()
  .from(conversations)
  .where(eq(conversations.matchId, matchId));

if (!conversation) {
  console.log("MATCH:", match);

  [conversation] = await db
  .insert(conversations)
  .values({
    matchId: match.id,
    user1Id: match.user1Id,
    user2Id: match.user2Id,
    lastMessageAt: new Date(),
  })
  .returning();

}


    return c.json({
      ...conversation,
      status: match.status,
      currentUserId: user.id,
      otherUser: {
        id: otherUser.id || otherUserId,
        name: otherUser.name || "Unknown User",
        imageUrl: otherUser.imageUrl || null,
      },
    });
  });

export { matchesApp };