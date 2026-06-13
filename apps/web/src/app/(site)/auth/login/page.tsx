"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại.",
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description:
          err instanceof Error
            ? err.message
            : "Email hoặc mật khẩu không đúng.",
      });
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12"
    >
      <div suppressHydrationWarning className="w-full max-w-md space-y-6">
        <div suppressHydrationWarning className="text-center">
          <h1 className="font-jakarta text-2xl font-bold">Đăng nhập</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Chào mừng bạn quay trở lại DealXin
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div suppressHydrationWarning className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div suppressHydrationWarning className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <div suppressHydrationWarning className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="pr-10"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-primary hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>

        {/* Demo credentials */}
        <div
          suppressHydrationWarning
          className="rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground"
        >
          <p className="mb-1 font-medium">Demo:</p>
          <p>Admin: admin@dealxin.com / admin123</p>
          <p>User: demo@dealxin.local / user1234</p>
        </div>
      </div>
    </div>
  );
}
