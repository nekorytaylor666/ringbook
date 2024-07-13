import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Book, Inbox, LogOut, Torus } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Index,
  beforeLoad: async ({ context }) => {
    const session = await supabase.auth.getSession();
    console.log(session);
    if (session.data.session === null) {
      redirect({ to: "/login", throw: true });
    }
  },
});

function Index() {
  const navigate = useNavigate();
  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };
  return (
    <div className="flex min-h-screen w-full max-w-screen bg-muted/40">
      <div className="group fixed z-50 flex h-full w-[60px] flex-col gap-2 overflow-hidden border-r bg-background px-3 transition-all duration-200 ease-in-out hover:w-[256px]">
        <div className="relative flex items-center gap-2 text-accent-foreground">
          <Torus className="my-4 size-9" />
          <span className="logo">RingBook AI</span>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            className="w-[36px] justify-start px-1.5 font-mono text-muted-foreground group-hover:w-full"
            variant="ghost"
            asChild
          >
            <Link
              to="/dashboard/feed"
              activeProps={{
                className: "bg-accent text-primary",
              }}
            >
              <div className="relative flex items-center gap-2">
                <Inbox className="size-6 " />
                <span className="absolute left-6 opacity-0 transition-all duration-200 ease-in-out group-hover:ml-2 group-hover:inline group-hover:opacity-100">
                  Feed
                </span>
              </div>
            </Link>
          </Button>
          <Button
            className="w-[36px] justify-start px-1.5 font-mono text-muted-foreground group-hover:w-full"
            variant="ghost"
            asChild
          >
            <Link
              to="/dashboard/ledger"
              activeProps={{
                className: "bg-accent text-primary",
              }}
            >
              <div className="relative flex items-center gap-2">
                <Book className="size-6 " />
                <span className="absolute left-6 opacity-0 transition-all duration-200 ease-in-out group-hover:ml-2 group-hover:inline group-hover:opacity-100">
                  Ledger
                </span>
              </div>
            </Link>
          </Button>
        </div>
        <div className="flex h-full flex-col justify-end pb-8">
          <Button
            className="w-[36px] justify-start px-1.5 font-mono text-muted-foreground group-hover:w-full"
            variant="ghost"
            onClick={onLogout}
          >
            <div className="relative flex items-center gap-2">
              <LogOut className="size-6 " />
              <span className="absolute left-6 opacity-0 transition-all duration-200 ease-in-out group-hover:ml-2 group-hover:inline group-hover:opacity-100">
                Logout
              </span>
            </div>
          </Button>
        </div>
      </div>
      <div className="ml-[60px] min-h-screen w-full bg-background">
        <Outlet />
      </div>
    </div>
  );
}
