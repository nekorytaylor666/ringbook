import { ChatAnthropic } from "@langchain/anthropic";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

import {
  OutputFixingParser,
  StructuredOutputParser,
} from "langchain/output_parsers";
import { z } from "zod";

import { db } from "../db"; // Assuming you have a db connection setup
import { journalEntries, transactions } from "../db/schema";

// ... existing code ...
const model = new ChatAnthropic({
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.ANTHROPIC_MODEL,
});
export const journalEntrySchema = z.object({
  date: z.string().describe("Date of the transaction (YYYY-MM-DD format)"),
  description: z.string().describe("Brief description of the transaction"),
  entries: z.array(
    z.object({
      accountId: z.number().describe("Account id"),
      accountName: z.string().describe("Account name"),
      accountType: z.string().describe("Account type"),
      debit: z.number().describe("Debit amount (if applicable)"),
      credit: z.number().describe("Credit amount (if applicable)"),
    })
  ),
  totalDebit: z.number().describe("Total debit amount"),
  totalCredit: z.number().describe("Total credit amount"),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;

const journalEntryParser =
  StructuredOutputParser.fromZodSchema(journalEntrySchema);

const journalEntryFixParser = OutputFixingParser.fromLLM(
  new ChatAnthropic({
    temperature: 0,
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
  }),
  journalEntryParser
);

const journalEntryChain = RunnableSequence.from([
  new ChatAnthropic({
    temperature: 0,
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
  }),
  journalEntryFixParser,
]);

export async function generateJournalEntry(
  accountsJson: string,
  transactionDescription: string,
  images: string[],
  pdfs: string[]
) {
  const parser = new JsonOutputParser<JournalEntry>();

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an AI assistant tasked with generating journal entries in JSON format for accounting purposes. You will be provided with an accounts structure and a transaction description. Your goal is to create a valid journal entry based on the given information.

First, here is the accounts structure you will be working with:

<accounts_json>
{accountsJson}
</accounts_json>

Your task is to generate a journal entry based on a given transaction description. The journal entry should be in JSON format and follow the accounting equation: Assets = Liabilities + Equity.

When interpreting the transaction description:
1. Identify the accounts involved in the transaction.
2. Determine whether each account should be debited or credited.
3. Calculate the amount for each account affected.

{format_instructions}


Analyze the transaction description, identify the accounts involved, and create a journal entry in the specified JSON format. Ensure that the total debits equal the total credits in your entry.

Return only JSON. Make sure its valid JSON. It will be parsed by another script so remove everything that is not JSON.`,
    ],
    [
      "user",
      `Now, generate a journal entry based on the following transaction description:

<transaction_description>
{transactionDescription}
</transaction_description>`,
    ],
    // ["user", [{ type: "image_url", image_url: "{image}" }]],
    ...images.map((image, index) => [
      "user",
      [{ type: "image_url", image_url: `{image${index}}` }],
    ]),
    ...pdfs.map((pdf, index) => ["user", `{pdf${index}}`]),
  ]);
  const chain = prompt.pipe(model).pipe(parser);
  const context = {
    accountsJson: accountsJson,
    transactionDescription: transactionDescription,
    format_instructions: journalEntryParser.getFormatInstructions(),
  };
  for (let index = 0; index < images.length; index++) {
    const element = images[index];
    context[`image${index}`] = element;
  }
  for (let index = 0; index < pdfs.length; index++) {
    const element = pdfs[index];
    context[`pdf${index}`] = element;
  }
  console.log(context);
  const response = await chain.invoke(context);
  return response;
}
