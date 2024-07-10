import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";
import { Label } from "@radix-ui/react-label";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const emailVerifyOtpSchema = z.object({
  email: z.string().email(),
});

export const Route = createFileRoute("/verifyOtp")({
  component: () => <LoginForm />,
  validateSearch: (search) => emailVerifyOtpSchema.parse(search),
});

export function LoginForm() {
  const { email } = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, getValues, setValue } = useForm();
  const navigate = useNavigate();
  async function handleOTPInput(otp: string) {
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    console.log(session);
  }

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    await handleOTPInput(values.otp);
    navigate({ to: "/dashboard/feed" });
    setIsLoading(false);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex h-screen items-center justify-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Verification Code</CardTitle>
            <CardDescription>
              Enter your one-time code below to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2 justify-center">
                <Label htmlFor="email">One-time Code</Label>
                <InputOTP
                  name="otp"
                  onChange={(e) => setValue("otp", e)}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot className="size-12" index={0} />
                    <InputOTPSlot className="size-12" index={1} />
                    <InputOTPSlot className="size-12" index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot className="size-12" index={3} />
                    <InputOTPSlot className="size-12" index={4} />
                    <InputOTPSlot className="size-12" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" className="w-full">
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
