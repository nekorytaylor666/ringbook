import { AddJournalEntry } from "@/components/feed/AddJournalEntry";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { H4 } from "@/components/ui/typography";
import { trpc } from "@/lib/trpc";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
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
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Heart className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MessageCircle className="size-4" />
        </Button>
      </CardFooter>
    </Card>
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
