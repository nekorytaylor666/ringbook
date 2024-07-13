import { trpc } from "@/lib/trpc";

import { FileSpreadsheet, FileText, MessageCircle, Stamp } from "lucide-react";
import { useState } from "react";
import type { TweetWithProfile } from "../../../../backend/src/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Toggle } from "../ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TweetProps {
  tweet: TweetWithProfile;
}

export function Tweet({ tweet }: TweetProps) {
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

export function TweetSkeleton() {
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
