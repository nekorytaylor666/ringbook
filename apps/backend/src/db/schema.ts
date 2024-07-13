import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

export const users = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const profile = pgTable("profile", {
  // Matches id from auth.users table in Supabase
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }).notNull(),
  image: varchar("image", { length: 256 }),
});

export type Profile = typeof profile.$inferSelect;

export const tweets = pgTable(
  "tweets",
  {
    tweetId: uuid("tweet_id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    tweetContent: text("tweet_content"),
    tweetDate: timestamp("tweet_date"),
    processedStatus: boolean("processed_status"),
    fileUrls: jsonb("file_urls"),
  },
  (table) => {
    return {
      userIdIdx: index("tweets_user_id_idx").on(table.userId),
      tweetDateIdx: index("tweets_tweet_date_idx").on(table.tweetDate),
    };
  }
);

export type Tweet = typeof tweets.$inferSelect;
export type TweetWithProfile = Tweet & { profile: Profile | null };

export const tweetRelations = relations(tweets, ({ one, many }) => ({
  user: one(users, { fields: [tweets.userId], references: [users.id] }),
  profile: one(profile, { fields: [tweets.userId], references: [profile.id] }),
  transaction: one(transactions, {
    fields: [tweets.tweetId],
    references: [transactions.tweetId],
  }),
}));

// New organization table
export const organizations = pgTable("organizations", {
  organizationId: serial("organization_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the enum
export const normalBalanceEnum = pgEnum("normal_balance", ["debit", "credit"]);

export const accounts = pgTable(
  "accounts",
  {
    accountId: serial("account_id").primaryKey(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.organizationId),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // Asset, Liability, Equity, Revenue, Expense
    normalBalance: normalBalanceEnum("normal_balance").notNull(),
    balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      organizationIdIdx: index("accounts_organization_id_idx").on(
        table.organizationId
      ),
      typeIdx: index("accounts_type_idx").on(table.type),
    };
  }
);

export const transactions = pgTable(
  "transactions",
  {
    transactionId: serial("transaction_id").primaryKey(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.organizationId),
    description: text("description").notNull(),
    date: date("date").notNull(),
    tweetId: uuid("tweet_id").references(() => tweets.tweetId),
    isApproved: boolean("is_approved").default(false),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      organizationIdIdx: index("transactions_organization_id_idx").on(
        table.organizationId
      ),
      dateIdx: index("transactions_date_idx").on(table.date),
      tweetIdIdx: index("transactions_tweet_id_idx").on(table.tweetId),
      approvedByIdx: index("transactions_approved_by_idx").on(table.approvedBy),
    };
  }
);

export const transactionRelations = relations(
  transactions,
  ({ many, one }) => ({
    journalEntries: many(journalEntries),
    approvedByUser: one(users, {
      fields: [transactions.approvedBy],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [transactions.organizationId],
      references: [organizations.organizationId],
    }),
    tweet: one(tweets, {
      fields: [transactions.tweetId],
      references: [tweets.tweetId],
    }),
  })
);

export type Transaction = typeof transactions.$inferSelect;

export const journalEntries = pgTable(
  "journal_entries",
  {
    entryId: serial("entry_id").primaryKey(),
    transactionId: integer("transaction_id")
      .notNull()
      .references(() => transactions.transactionId),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.accountId),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    isCredit: boolean("is_credit").notNull(),
  },
  (table) => {
    return {
      transactionIdIdx: index("journal_entries_transaction_id_idx").on(
        table.transactionId
      ),
      accountIdIdx: index("journal_entries_account_id_idx").on(table.accountId),
    };
  }
);

export type JournalEntry = typeof journalEntries.$inferSelect;

// Updated relations
export const organizationRelations = relations(organizations, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
}));

export const accountRelations = relations(accounts, ({ many, one }) => ({
  journalEntries: many(journalEntries),
  organization: one(organizations, {
    fields: [accounts.organizationId],
    references: [organizations.organizationId],
  }),
}));

export type Account = typeof accounts.$inferSelect;

export type JournalEntryExpanded = JournalEntry & {
  account: Account;
};

export type TransactionExpanded = Transaction & {
  journalEntries: JournalEntryExpanded[];
};

export const journalEntryRelations = relations(journalEntries, ({ one }) => ({
  transaction: one(transactions, {
    fields: [journalEntries.transactionId],
    references: [transactions.transactionId],
  }),
  account: one(accounts, {
    fields: [journalEntries.accountId],
    references: [accounts.accountId],
  }),
}));
