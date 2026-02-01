
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import {
  createMatch,
  getGoalsByUserAndCommunity,
  getGoalsByUsersAndCommunity,
  getMembersInCommunity,
  getPartnerUserId,
  getUserMatchesInCommunity,
  getUsersByIds,
} from "./db-helpers";
import { getOrCreateUserByClerkId } from "./user-utils";
import { conversationSummaries, learningGoals, messages } from "@/db/schema";
import { db } from "@/db";
import { desc, eq } from "drizzle-orm";

export const aiMatchUsers = async (
  user: NonNullable<Awaited<ReturnType<typeof getOrCreateUserByClerkId>>>,
  communityId: string
) => {
  try {
    const currentUserGoals = await getGoalsByUserAndCommunity(user.id, communityId);
    const members = await getMembersInCommunity(communityId, user.id);
    const existingMatches = await getUserMatchesInCommunity(user.id, communityId);

    const existingMatchUserIds = new Set(
      existingMatches.map((m) => getPartnerUserId(m, user.id))
    );

    const potentialMemberIds = members
      .filter((m) => !existingMatchUserIds.has(m.user.id))
      .map((m) => m.user.id);

    const goalsMap = await getGoalsByUsersAndCommunity(potentialMemberIds, communityId);

    const potentialPartners = [];
    const memberWithoutGoals = [];

    for (const member of members) {
      if (existingMatchUserIds.has(member.user.id)) continue;
// rGoals = goalsMap.get(member.user.id) || [];

// // 🔥 DEV MODE: allow even users without goals
// potentialPartners.push({
//   userId: member.user.id,
//   username: member.user.name,
//   goals:
//     memberGoals.length > 0
//       ? memberGoals.map((g) => ({
//           title: g.title,
//           description: g.description || "",
//         }))
//       : [
//           {
//             title: "No goals yet",
//             description: "User has not added learning goals",
//           },
//         ],
// });

const memberGoals = goalsMap.get(member.user.id) || [];

// 🔥 DEV MODE: allow even users without goals
potentialPartners.push({
  userId: member.user.id,
  username: member.user.name,
  goals:
    memberGoals.length > 0
      ? memberGoals.map((g) => ({
          title: g.title,
          description: g.description || "",
        }))
      : [
          {
            title: "No goals yet",
            description: "User has not added learning goals",
          },
        ],
});


    }

    //    else {
    //     memberWithoutGoals.push(member.user.name);
    //   }
    // }

    console.log("Current user goals:", currentUserGoals);
    console.log("Total members:", members.length);
    console.log("Potential partners:", potentialPartners.length);
    console.log("Members without goals:", memberWithoutGoals);

    if (potentialPartners.length === 0) {
      return { matched: 0, matches: [], message: "No potential partners found with learning goals" };
    }

    // ✅ AI Matching with Gemini v1
    const prompt = `You are an AI matching assistant for a learning platform...
Current User: ${user.name}
Their Learning Goals:
${currentUserGoals.map((g) => `- ${g.title}: ${g.description}`).join("\n")}

Potential Partners:
${potentialPartners.map((p, idx) => `
${idx + 1}. ${p.username}
   Goals:
   ${p.goals.map((g) => `   - ${g.title}: ${g.description}`).join("\n")}
`).join("\n")}

Task: Identify TOP 3 compatible learning partners. Return ONLY JSON array of 1-3 indices, e.g., [2,1,3].
Return [] if no match.`;

   const { text } = await generateText({
  model: google("gemini-2.5-flash", { apiVersion: "v1" }),
  prompt,
  temperature: 0.2,
});


    let jsonText = text.trim().replace(/^```(json)?\s*/, "").replace(/```$/, "");

    let matchIndices: number[] = [];
    try {
      matchIndices = JSON.parse(jsonText);
      if (!Array.isArray(matchIndices)) matchIndices = [];
    } catch {
      const arrayMatch = jsonText.match(/\[[\d,\s]+\]/);
      if (arrayMatch) matchIndices = JSON.parse(arrayMatch[0]);
      else throw new Error("AI returned invalid response");
    }

    const createdMatches = [];
    for (const idx of matchIndices) {
      const partnerIndex = idx - 1;
      if (partnerIndex >= 0 && partnerIndex < potentialPartners.length) {
        const partner = potentialPartners[partnerIndex];
        const match = await createMatch(user.id, partner.userId, communityId);
        createdMatches.push({ ...match, partnerName: partner.username });
      }
    }

    console.log("Created matches:", createdMatches);
    return { matched: createdMatches.length, matches: createdMatches };
  } catch (error) {
    console.error("Error matching users", error);
    return { matched: 0, matches: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// -----------------------------
// Conversation Summaries
// -----------------------------
export const generateAISummaries = async (
  conversationId: string,
  conversationMessages: (typeof messages.$inferSelect)[]
) => {
  try {
    const userIds = [...new Set(conversationMessages.map((m) => m.senderId))];
    const usersMap = await getUsersByIds(userIds);

    const formattedMessages = conversationMessages.map((m) => {
      const user = usersMap.get(m.senderId);
      return `${user?.name}: ${m.content}`;
    });
    const conversationText = formattedMessages.join("\n");

    const prompt = `You are an AI assistant that summarizes learning conversations.
Conversation:
${conversationText}

Return JSON:
{
  "summary": "2-3 sentence overview",
  "keyPoints": ["point1", "point2"],
  "actionItems": ["action1"],
  "nextSteps": ["step1"]
}`;

    // const { text } = await generateText({
    //   model: google("gemini-2.5-flash", { apiVersion: "v1" }),
    //   prompt,
    //   temperature: 0.2,
    //   maxTokens: 512,
    // });
    const { text } = await generateText({
  model: google("gemini-2.5-flash", { apiVersion: "v1" }),
  prompt,
  temperature: 0.2,
});


    let jsonText = text.trim().replace(/^```(json)?\s*/, "").replace(/```$/, "");
    const parsed = JSON.parse(jsonText);

    const [summary] = await db
      .insert(conversationSummaries)
      .values({
        conversationId,
        summary: parsed.summary || "",
        keyPoints: parsed.keyPoints || [],
        actionItems: parsed.actionItems || [],
        nextSteps: parsed.nextSteps || [],
      })
      .returning();

    return summary;
  } catch (error) {
    console.error("Error generating AI summary", error);
    throw new Error("Error generating AI summary");
  }
};

export const getLatestConversationSummary = async (conversationId: string) => {
  const [summary] = await db
    .select()
    .from(conversationSummaries)
    .where(eq(conversationSummaries.conversationId, conversationId))
    .orderBy(desc(conversationSummaries.generatedAt))
    .limit(1);

  return summary || null;
};
