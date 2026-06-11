"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bookmark,
  LayoutDashboard,
  PlusCircle,
  Tag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { dealsApi } from "@/lib/api";

export default function DashboardPage() {
  const { user, isHydrated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isHydrated, isLoading, user, router]);

  const { data: myDeals, isLoading: myDealsLoading } = useQuery({
    queryKey: ["my-deals"],
    queryFn: () => dealsApi.myDeals({ limit: 5 }),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => dealsApi.myBookmarks({ limit: 5 }),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  if (!isHydrated || isLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-jakarta text-2xl font-bold">
          Xin chào, {user.fullName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chào mừng đến với dashboard của bạn
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button asChild className="h-auto py-4 justify-start gap-3">
          <Link href="/deals/new">
            <PlusCircle className="h-5 w-5" />
            <span className="font-semibold">Đăng deal mới</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto py-4 justify-start gap-3"
        >
          <Link href="/deals?sortBy=hot">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold">Deal hot hôm nay</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto py-4 justify-start gap-3"
        >
          <Link href="/dashboard/bookmarks">
            <Bookmark className="h-5 w-5" />
            <span className="font-semibold">Deal đã lưu</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Deal của tôi
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/deals">
                Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myDealsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : myDeals && myDeals.data.length > 0 ? (
              <div className="space-y-3">
                {myDeals.data.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {deal.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.upvoteCount} upvote · {deal.viewCount} lượt xem
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        deal.status === "APPROVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : deal.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {deal.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Bạn chưa đăng deal nào.
                </p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/deals/new">Đăng deal đầu tiên</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookmarks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Deal đã lưu
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookmarks">
                Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookmarksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : bookmarks && bookmarks.data.length > 0 ? (
              <div className="space-y-3">
                {bookmarks.data.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {deal.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.discountPercent > 0 && (
                          <span className="text-primary font-medium">
                            -{deal.discountPercent}%
                          </span>
                        )}{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: deal.currency,
                          maximumFractionDigits: 0,
                        }).format(deal.salePrice)}
                      </p>
                    </div>
                    {deal.discountPercent > 0 && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        -{deal.discountPercent}%
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Bạn chưa lưu deal nào.
                </p>
                <Button size="sm" variant="outline" className="mt-3" asChild>
                  <Link href="/deals">Khám phá deals</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin link */}
      {user.role === "ADMIN" && (
        <div className="mt-8">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Quản trị viên</h3>
                  <p className="text-sm text-muted-foreground">
                    Quản lý deals, người dùng và nội dung
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/admin">
                  Vào trang quản trị
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
