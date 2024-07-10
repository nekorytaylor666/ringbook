import { Buffer } from "node:buffer";
import { trpcServer } from "@hono/trpc-server";
import { eq, sql } from "drizzle-orm";
import FormData from "form-data";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  LlamaParseReader,
  // we'll add more here later
} from "llamaindex/readers/LlamaParseReader";
import { db, dbDirect } from "./db/db";
import { accounts, journalEntries, transactions, tweets } from "./db/schema";
import { generateJournalEntry } from "./lib/extractJournalEntry";
import {
  insertJournalEntryToDB,
  processFormDataJournalEntry,
} from "./lib/journalEntryHelpers";
import { appRouter } from "./routes/_app";

// import { processFile } from "./lib/fileProcessor"; // You'll need to implement this

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => c.text("Hono!"));

app.post("/api/journal/generate", async (c) => {
  const formData = await c.req.formData();
  const { entry, profileId, base64Files, pdfTexts, journalEntry } =
    await processFormDataJournalEntry(formData);
  return c.json({ journalEntry });
});

app.post("/api/journal", async (c) => {
  const formData = await c.req.formData();
  const { entry, profileId, base64Files, pdfTexts, journalEntry } =
    await processFormDataJournalEntry(formData);
  await insertJournalEntryToDB(journalEntry, entry, profileId);
  return c.json({ message: journalEntry });
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

export default {
  port: 8787,
  fetch: app.fetch,
};
