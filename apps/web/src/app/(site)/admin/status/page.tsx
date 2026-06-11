"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

interface HealthStatus {
  status: string;
  info?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

export default function StatusPage() {
  const { user, isHydrated } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data, isLoading, isError, refetch, isFetching } =
    useQuery<HealthStatus>({
      queryKey: ["health-check"],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/health`,
        );
        if (!res.ok) throw new Error("Health check failed");
        setLastUpdated(new Date());
        return res.json();
      },
      refetchInterval: 30000,
    });

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Skeleton className="mb-8 h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </p>
      </div>
    );
  }

  const components = data?.details
    ? Object.entries(data.details).map(([name, info]: [string, unknown]) => {
        const detailInfo = info as { status?: string };
        return {
          name,
          status: detailInfo.status ?? "unknown",
        };
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-jakarta text-2xl font-bold">System Status</h1>
          <p className="text-sm text-muted-foreground">
            Giám sát trạng thái hệ thống DealXin
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
            isError
              ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
              : data?.status === "ok"
                ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"
          }`}
        >
          {isError ? (
            <AlertTriangle className="h-4 w-4" />
          ) : data?.status === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Activity className="h-4 w-4" />
          )}
          {isError
            ? "Không thể kết nối"
            : data?.status === "ok"
              ? "Hệ thống hoạt động tốt"
              : "Cảnh báo"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-3 h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="h-4 w-4" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {components.find((c) => c.name === "database") ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Kết nối thành công
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Chưa kiểm tra
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="h-4 w-4" />
                  API Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isError ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Không phản hồi
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Hoạt động
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
