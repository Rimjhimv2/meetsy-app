
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth-middleware";
import { generateAISummaries, getLatestConversationSummary } from "@/lib/ai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { asc, eq } from "drizzle-orm";
type Variables = {
  userId: string;
};
const AI_USER_ID = "00000000-0000-0000-0000-000000000000";

const conversationsApp = new Hono<{ Variables: Variables }>()
  .use("/*", authMiddleware)
  .get("/:conversationId/messages", async (c) => {
    const conversationId = c.req.param("conversationId");

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    return c.json(conversationMessages);
  })
  

// .post("/:conversationId/messages", async (c) => {
// .post(
//   "/:conversationId/messages",
//   zValidator(
//     "json",
//     z.object({
//       content: z.string().min(1),
//     })
//   ),
//   async (c) => {

//   const conversationId = c.req.param("conversationId");
//   const user = c.get("user");

//   // const { content } = await c.req.json();
//   const { content } = c.req.valid("json");


//   // 1️⃣ User message save
//   await db.insert(messages).values({
//     conversationId,
//     content,
//     senderId: user.id,
//     role: "user",
//   });

//   // 2️⃣ Conversation history nikaalo
//   const history = await db
//     .select()
//     .from(messages)
//     .where(eq(messages.conversationId, conversationId))
//     .orderBy(asc(messages.createdAt))
//     .limit(20);


// const conversationText = history
//   .map((m) =>
//     m.role === "user"
//       ? `User: ${m.content}`
//       : `Assistant: ${m.content}`
//   )
//   .join("\n");

// const prompt = `You are a friendly, concise chat assistant.

// Conversation so far:
// ${conversationText}

// Now respond to the user's last message.`;



//   // 4️⃣ Gemini call
//  const { text } = await generateText({
//   model: google("gemini-2.5-flash"),

//   prompt,
//   temperature: 0.2,
// });




//   // 5️⃣ AI reply save




// // const aiText = text?.trim() || "";

// // await db.insert(messages).values({
// //   conversationId,
// //   content: aiText,
// //   senderId: null,          // ✅ correct
// //   role: "assistant",       // ✅ correct
// // });

// const aiText = text?.trim() || "";

// // DB insert
// // await db.insert(messages).values({
// //   conversationId,
// //   content: aiText,
// //   senderId: null,
// //   role: "assistant",
// // });

// // // response
// // return c.json({
// //   userMessage: content,
// //   aiReply: aiText,
// // });



// //   // 6️⃣ Update lastMessageAt
// //   await db
// //     .update(conversations)
// //     .set({ lastMessageAt: new Date() })
// //     .where(eq(conversations.id, conversationId));

// //   return c.json({
// //     userMessage: content,
// //     aiReply: aiMessage,
// //   });
// // })


// const aiText = text?.trim() || "";

// // 5️⃣ AI reply save
// await db.insert(messages).values({
//   conversationId,
//   content: aiText,
//   senderId: AI_USER_ID,   // ✅ FIXED
//   role: "assistant",
// });

// // 6️⃣ Update lastMessageAt
// await db
//   .update(conversations)
//   .set({ lastMessageAt: new Date() })
//   .where(eq(conversations.id, conversationId));

// // 7️⃣ response
// return c.json({
//   userMessage: content,
//   aiReply: aiText,
// })
.post(
  "/:conversationId/messages",
  zValidator(
    "json",
    z.object({
      content: z.string().min(1),
    })
  ),
  async (c) => {
    const conversationId = c.req.param("conversationId");
    const user = c.get("user");
    const { content } = c.req.valid("json");

    // 1️⃣ User message save
    await db.insert(messages).values({
      conversationId,
      content,
      senderId: user.id,
      role: "user",
    });

    // 2️⃣ Conversation history
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(20);

    const conversationText = history
      .map((m) =>
        m.role === "user"
          ? `User: ${m.content}`
          : `Assistant: ${m.content}`
      )
      .join("\n");

    const prompt = `You are a friendly, concise chat assistant.

Conversation so far:
${conversationText}

Now respond to the user's last message.`;

    // 3️⃣ Gemini call
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
      temperature: 0.2,
    });

    const aiText = text?.trim() || "";

    // 4️⃣ AI message save
    await db.insert(messages).values({
      conversationId,
      content: aiText,
      senderId: AI_USER_ID,
      role: "assistant",
    });

    // 5️⃣ Update conversation
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    // 6️⃣ Response
    return c.json({
      userMessage: content,
      aiReply: aiText,
    });
  }
)


  .post("/:conversationId/summarize", async (c) => {
    const conversationId = c.req.param("conversationId");

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    const summary = await generateAISummaries(
      conversationId,
      conversationMessages
    );

    return c.json(summary);
  })
  .get("/:conversationId/summary", async (c) => {
    const conversationId = c.req.param("conversationId");
    const summary = await getLatestConversationSummary(conversationId);
    return c.json(summary);
  });
export { conversationsApp };