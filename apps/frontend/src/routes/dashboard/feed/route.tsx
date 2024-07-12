import { AddJournalEntry } from "@/components/feed/AddJournalEntry";
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
interface TweetProps {
  tweet: TweetWithProfile;
}

function Tweet({ tweet }: TweetProps) {
  const [showTransaction, setShowTransaction] = useState(false);
  const { data, isLoading } = trpc.getTransactionByTweetId.useQuery(
    tweet.tweetId,
    {
      enabled: showTransaction,
    },
  );

  return (
    <Card className="border-none">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src="/path-to-avatar-image.jpg" alt="User avatar" />
            <AvatarFallback>{tweet.profile?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">
              {tweet.profile?.name}
            </p>
            <p className="mt-1">{tweet.tweetContent}</p>
            {tweet.fileUrls && tweet.fileUrls.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {tweet.fileUrls.map((url, index) => (
                  <FilePreview key={index} url={url} />
                ))}
              </div>
            )}
          </div>
        </div>
        {showTransaction &&
          (isLoading ? (
            <TransactionTableSkeleton />
          ) : data?.transaction ? (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transaction.journalEntries.map((entry) => (
                  <TableRow key={entry.entryId}>
                    <TableCell className="font-medium">
                      {entry.account.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {!entry.isCredit ? `$${entry.amount}` : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.isCredit ? `$${entry.amount}` : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No transaction found for this tweet.
            </p>
          ))}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Toggle
                pressed={showTransaction}
                onPressedChange={setShowTransaction}
                aria-label="Toggle transaction"
                className="rounded-full"
              >
                <FileSpreadsheet className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>View journal entry</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Stamp className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Approve</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reply</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}

function FilePreview({ url }: { url: string }) {
  const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) !== null;
  const isPDF = url.toLowerCase().endsWith(".pdf");

  if (isImage) {
    return (
      <img
        src={url}
        alt="Uploaded content"
        className="w-full object-cover rounded-md"
      />
    );
  } else if (isPDF) {
    return (
      <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">PDF Document</span>
      </div>
    );
  } else {
    return (
      <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
        <FileText className="w-8 h-8 text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">File</span>
      </div>
    );
  }
}

function TransactionTableSkeleton() {
  return (
    <div className="mt-4">
      <Skeleton className="h-8 w-full mb-2" />
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex justify-between mb-2">
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

function TweetSkeleton() {
  return (
    <Card className="border-none ">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardFooter>
    </Card>
  );
}
