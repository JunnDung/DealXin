"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Grid3X3, List, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { DealCard } from "@/components/deal-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { dealsApi, type DealsQueryParams } from "@/lib/api";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "hot", label: "Hot nhất" },
  { value: "discount", label: "Giảm nhiều nhất" },
  { value: "expiring", label: "Sắp hết hạn" },
];

const platformOptions = [
  { value: "", label: "Tất cả nền tảng" },
  { value: "SHOPEE", label: "Shopee" },
  { value: "LAZADA", label: "Lazada" },
  { value: "TIKTOK_SHOP", label: "TikTok Shop" },
];

function DealsContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const parameters: DealsQueryParams = {
    sortBy:
      (searchParams.get("sortBy") as DealsQueryParams["sortBy"]) || "newest",
    platform: searchParams.get("platform") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    search: searchParams.get("search") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    limit: 12,
  };

  const {
    data: dealsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["deals", parameters],
    queryFn: () => dealsApi.list(parameters),
    staleTime: 30 * 1000,
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "up" | "down" }) =>
      dealsApi.vote(id, type),
    onError: () => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể bình chọn. Hãy đăng nhập.",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => dealsApi.bookmark(id),
    onSuccess: () => {
      toast({ title: "Đã lưu deal!" });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Hãy đăng nhập để lưu deal.",
      });
    },
  });

  const activeFilters = [
    parameters.sortBy && parameters.sortBy !== "newest"
      ? {
          key: "sortBy",
          label: sortOptions.find((s) => s.value === parameters.sortBy)?.label,
        }
      : null,
    parameters.platform
      ? {
          key: "platform",
          label: platformOptions.find((p) => p.value === parameters.platform)
            ?.label,
        }
      : null,
    parameters.search
      ? { key: "search", label: `"${parameters.search}"` }
      : null,
  ].filter(Boolean);

  const clearFilter = (key: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.pushState({}, "", url.toString());
    queryClient.invalidateQueries({ queryKey: ["deals"] });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-jakarta text-2xl font-bold">
          {parameters.search
            ? `Kết quả: "${parameters.search}"`
            : parameters.sortBy === "hot"
              ? "Deal Hot Nhất"
              : parameters.sortBy === "expiring"
                ? "Sắp Hết Hạn"
                : parameters.sortBy === "discount"
                  ? "Giảm Nhiều Nhất"
                  : "Tất cả Khuyến Mãi"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dealsData
            ? `${dealsData.meta.total} deal được tìm thấy`
            : "Đang tải..."}
        </p>
      </div>

      {/* Filters bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select
          value={parameters.sortBy}
          onValueChange={(v) => {
            const url = new URL(window.location.href);
            url.searchParams.set("sortBy", v);
            window.history.pushState({}, "", url.toString());
            queryClient.invalidateQueries({ queryKey: ["deals"] });
          }}
        >
          <SelectTrigger className="w-40">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={parameters.platform || ""}
          onValueChange={(v) => {
            const url = new URL(window.location.href);
            if (v) url.searchParams.set("platform", v);
            else url.searchParams.delete("platform");
            window.history.pushState({}, "", url.toString());
            queryClient.invalidateQueries({ queryKey: ["deals"] });
          }}
        >
          <SelectTrigger className="w-40">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Nền tảng" />
          </SelectTrigger>
          <SelectContent>
            {platformOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilters.map(
          (f) =>
            f && (
              <Badge key={f.key} variant="secondary" className="gap-1">
                {f.label}
                <button
                  onClick={() => clearFilter(f.key)}
                  className="ml-1 rounded hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ),
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Deals grid */}
      {isLoading ? (
        <div
          className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <Skeleton className="aspect-[16/9] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            Không thể tải deals. Hãy thử lại.
          </p>
        </div>
      ) : dealsData && dealsData.data.length > 0 ? (
        <>
          <div
            className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {dealsData.data.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onVote={(type) => voteMutation.mutate({ id: deal.id, type })}
                onBookmark={() => bookmarkMutation.mutate(deal.id)}
                voting={voteMutation.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {dealsData.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: dealsData.meta.totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={
                    dealsData.meta.page === i + 1 ? "default" : "outline"
                  }
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("page", String(i + 1));
                    window.history.pushState({}, "", url.toString());
                    queryClient.invalidateQueries({ queryKey: ["deals"] });
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy deal nào.</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              window.history.pushState({}, "", "/deals");
              queryClient.invalidateQueries({ queryKey: ["deals"] });
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <DealsContent />
    </Suspense>
  );
}
