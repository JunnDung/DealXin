"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Bookmark,
  Eye,
  RefreshCw,
  Shield,
  Tag,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getAnalyticsOverview } from "@/lib/api";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10">
            <Icon className="h-6 w-6 text-saffron" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [days, setDays] = useState(7);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => getAnalyticsOverview(days),
    enabled: user?.role === "ADMIN",
  });

  if (user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </p>
      </div>
    );
  }

  const totals = data?.totals;
  const dealsByDay = data?.dealsByDay ?? [];
  const maxCount = Math.max(...dealsByDay.map((d) => d.count), 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-jakarta text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Thống kê hoạt động của DealXin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-2 flex items-center gap-1 border-b">
        <Link
          href="/admin"
          className="flex items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:border-saffron/50 hover:text-foreground transition-colors"
        >
          <Tag className="h-4 w-4" />
          Deals
        </Link>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-2 border-b-2 border-saffron px-4 py-2 text-sm font-medium text-foreground"
        >
          <Activity className="h-4 w-4" />
          Analytics
        </Link>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border bg-background p-1">
          {([7, 14, 30] as const).map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "ghost"}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d} ngày
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="mb-3 text-muted-foreground">
            Đã xảy ra lỗi khi tải dữ liệu
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Lượt xem"
              value={totals?.pageViews ?? 0}
              icon={Eye}
              description={`Trong ${days} ngày qua`}
            />
            <StatCard
              title="Upvote"
              value={totals?.upvotes ?? 0}
              icon={ThumbsUp}
              description={`Trong ${days} ngày qua`}
            />
            <StatCard
              title="Bookmark"
              value={totals?.bookmarks ?? 0}
              icon={Bookmark}
              description={`Trong ${days} ngày qua`}
            />
            <StatCard
              title="Tổng tương tác"
              value={totals?.total ?? 0}
              icon={Activity}
              description={`Trong ${days} ngày qua`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Deals được submit theo ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dealsByDay.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu
                </p>
              ) : (
                <div className="flex items-end gap-1" style={{ height: 160 }}>
                  {dealsByDay.map((d, i) => (
                    <div
                      key={i}
                      className="group relative flex flex-1 flex-col items-center"
                    >
                      <div
                        className="w-full rounded-t bg-saffron/80 transition-all hover:bg-saffron"
                        style={{
                          height: `${Math.max((d.count / maxCount) * 140, 4)}px`,
                        }}
                        title={`${d.date}: ${d.count} deals`}
                      />
                      <span className="mt-1 text-xs text-muted-foreground">
                        {new Date(d.date).toLocaleDateString("vi-VN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-foreground/90 px-2 py-1 text-xs text-background group-hover:block">
                        {d.count} deals
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
