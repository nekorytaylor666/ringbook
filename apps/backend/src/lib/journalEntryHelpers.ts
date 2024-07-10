import { Buffer } from "node:buffer";
import { eq, sql } from "drizzle-orm";
import FormData from "form-data";
import { LlamaParseReader } from "llamaindex/readers/LlamaParseReader";
import { db, dbDirect } from "../db/db";
import { accounts, journalEntries, transactions, tweets } from "../db/schema";
import { type JournalEntry, generateJournalEntry } from "./extractJournalEntry";

export async function processFormDataJournalEntry(
  formData: globalThis.FormData
) {
  const entry = formData.get("entry") as string;
  const profileId = formData.get("profileId") as string;
  const lammaParseKey = process.env.LLAMA_PARSE_API_KEY;
  const base64Files: string[] = [];
  const pdfTexts: string[] = [];

  // ... (file processing logic from the original code)

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("file") && value instanceof File) {
      console.log(`Processing file: ${key}`);
      const arrayBuffer = await value.arrayBuffer();

      if (value.type === "application/pdf") {
        // Use LlamaIndex API for PDF parsing
        const pdfFormData = new FormData();
        pdfFormData.append("file", Buffer.from(arrayBuffer), {
          filename: value.name,
          contentType: "application/pdf",
        });

        // set up the llamaparse reader
        const reader = new LlamaParseReader({
          resultType: "text",
          apiKey: lammaParseKey,
          fastMode: true,
        });

        // parse the document
        const documents = await reader.loadDataAsContent(
          new Uint8Array(arrayBuffer)
        );
        pdfTexts.push(documents[0].getContent());
      } else {
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        base64Files.push(`data:${value.type};base64,${base64}`);
      }
    }
  }

  console.log(
    `Processed ${base64Files.length} non-PDF files and ${pdfTexts.length} PDF files`
  );
  console.log(pdfTexts);
  const accountsJson = await db
    .select()
    .from(accounts)
    .where(eq(accounts.organizationId, 1));

  console.log("Generating journal entry");
  const journalEntry = await generateJournalEntry(
    JSON.stringify(accountsJson),
    entry,
    base64Files,
    pdfTexts
  );

  return { entry, profileId, base64Files, pdfTexts, journalEntry };
}

export async function generateJournalEntryFromData(
  accountsJson: string,
  entry: string,
  base64Files: string[],
  pdfTexts: string[]
) {
  return await generateJournalEntry(accountsJson, entry, base64Files, pdfTexts);
}

export async function insertJournalEntryToDB(
  journalEntry: JournalEntry,
  entry: string,
  profileId: string
) {
  await db.transaction(async (tx) => {
    // Create a tweet
    const [tweet] = await tx
      .insert(tweets)
      .values({
        userId: profileId, // You'll need to provide a valid user ID
        tweetContent: entry,
        tweetDate: new Date(),
        processedStatus: true,
      })
      .returning();

    // Use the created tweet's ID for the transaction
    const tweetId = tweet.tweetId;
    // Insert the transaction
    const [transaction] = await tx
      .insert(transactions)
      .values({
        organizationId: 1, // You'll need to provide this
        description: journalEntry.description,
        date: sql`now()`,
        tweetId: tweetId,
        isApproved: false,
      })
      .returning();

    // Insert journal entries and update account balances
    for (const entry of journalEntry.entries) {
      const amount = entry.credit || entry.debit;
      const isCredit = entry.credit !== 0;

      // Insert journal entry
      await tx.insert(journalEntries).values({
        transactionId: transaction.transactionId,
        accountId: entry.accountId,
        amount: amount.toString(),
        isCredit,
      });

      // Update account balance
      await tx
        .update(accounts)
        .set({
          balance: sql`
            CASE
              WHEN ${accounts.normalBalance} = 'debit' THEN
                ${accounts.balance} + ${isCredit ? -amount : amount}
              ELSE
                ${accounts.balance} + ${isCredit ? amount : -amount}
            END
          `,
        })
        .where(eq(accounts.accountId, entry.accountId));
    }
  });
}
