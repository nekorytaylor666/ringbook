import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginForm,
});

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();
  async function sendOTP(email: string) {
    const user = await utils.emailExists.fetch(email);
    // First, check if the user exists
    if (!user) {
      // If user doesn't exist, create a new user
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // We've handled user creation manually
        },
      });
      if (error) {
        console.error("Error sending OTP:", error);
      } else {
        console.log("OTP sent successfully:", data);
        toast.success("OTP sent successfully");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // We've handled user creation manually
        },
      });
      if (error) {
        console.error("Error sending OTP:", error);
      } else {
        console.log("OTP sent successfully:", data);
        toast.success("OTP sent successfully");
      }
    }
  }
  const onSubmit = async (values: any) => {
    setIsLoading(true);
    await sendOTP(values.email);

    setIsLoading(false);
    navigate({
      to: "/verifyOtp",
      search: {
        email: values.email,
      },
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex h-screen items-center justify-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to log in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="#" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
