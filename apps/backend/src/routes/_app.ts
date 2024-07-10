import { z } from "zod";
import { db, dbDirect } from "../db/db.js";
import { tweets } from "../db/schema.js";
import {
  generateJournalEntry,
  journalEntrySchema,
} from "../lib/extractJournalEntry";
import { insertJournalEntryToDB } from "../lib/journalEntryHelpers.js";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  tweetList: publicProcedure.query(async (c) => {
    const tweets = await db.query.tweets.findMany({
      with: {
        profile: true,
      },
    });

    return tweets;
  }),
  addTweet: publicProcedure
    .input(
      z.object({
        text: z.string(),
        profileId: z.string(),
        entry: journalEntrySchema.optional(),
      })
    )
    .mutation(async (c) => {
      if (c.input.entry) {
        return await insertJournalEntryToDB(
          c.input.entry,
          c.input.text,
          c.input.profileId
        );
      }
      const tweet = await db.insert(tweets).values({
        tweetDate: new Date(),
        userId: c.input.profileId,
        processedStatus: false,
        tweetContent: c.input.text,
      });
      return tweet;
    }),
  generateJournalEntry: publicProcedure
    .input(
      z.object({
        entry: z.string(),
      })
    )
    .mutation(async (c) => {
      const accountsJson = JSON.stringify({
        assets: [
          { id: "asset1", name: "HSBC" },
          { id: "asset2", name: "Inventory" },
          { id: "asset3", name: "Receive-later" },
          { id: "asset4", name: "Fixed-Asset" },
        ],
        liabilities: [
          { id: "liability1", name: "Credit-Card" },
          { id: "liability2", name: "Loan" },
          { id: "liability3", name: "Pay-Later" },
        ],
        equity: [{ id: "equity1", name: "Capital" }],
        revenue: [
          { id: "revenue1", name: "Sales" },
          { id: "revenue2", name: "Fee-Income" },
          { id: "revenue3", name: "Interest-Income" },
        ],
        expenses: [
          { id: "expense1", name: "Rent" },
          { id: "expense2", name: "Payroll" },
          { id: "expense3", name: "Meal" },
          { id: "expense4", name: "Marketing" },
          { id: "expense5", name: "Other" },
        ],
      });

      const journalEntry = await generateJournalEntry(
        accountsJson,
        c.input.entry
      );
      return { message: journalEntry };
    }),
  getAccounts: publicProcedure.query(async (c) => {
    const accounts = await db.query.accounts.findMany();
    return accounts;
  }),
});

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter;
