import { AddJournalEntry } from "@/components/feed/AddJournalEntry";
import { Tweet, TweetSkeleton } from "@/components/tweets/Tweets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H4 } from "@/components/ui/typography";
import { trpc } from "@/lib/trpc";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  FileText,
  Heart,
  Image,
  MessageCircle,
  Stamp,
} from "lucide-react";
import { useState } from "react";
import type { TweetWithProfile } from "../../../../../backend/src/db/schema";

export const Route = createFileRoute("/dashboard/feed")({
  component: FeedPage,
});

function FeedPage() {
  const { data, isLoading } = trpc.tweetList.useQuery();

  return (
    <div className="w-full bg-muted/70">
      <div className="flex h-16 items-center justify-start border-b px-4 bg-background">
        <H4>Feed</H4>
      </div>

      <div className="grid grid-cols-1 gap-4    ">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="container max-w-xl p-4 mt-8">
            <AddJournalEntry />
          </div>

          <div className="container max-w-xl p-4 flex flex-col-reverse gap-4">
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Just a skeleton
                  <TweetSkeleton key={index} />
                ))
              : data?.map((tweet) => (
                  <Tweet key={tweet.tweetId} tweet={tweet} />
                ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
