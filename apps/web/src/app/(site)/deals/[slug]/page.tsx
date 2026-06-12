"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Clock,
  ExternalLink,
  Eye,
  RefreshCw,
  Share2,
  ShoppingBag,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { type DealResponse, dealsApi } from "@/lib/api";

const platformLabels: Record<string, string> = {
  SHOPEE: "Shopee",
  LAZADA: "Lazada",
  TIKTOK_SHOP: "TikTok Shop",
  OTHER: "Khác",
};

function formatPrice(price: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${diffD} ngày trước`;
  if (diffH > 0) return `${diffH} giờ trước`;
  return "Vừa xong";
}

interface DealDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  const { slug } = use(params);
  const { user, isHydrated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: deal,
    isLoading,
    isError,
  } = useQuery<DealResponse>({
    queryKey: ["deal", slug],
    queryFn: () => dealsApi.getBySlug(slug),
    staleTime: 60 * 1000,
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "up" | "down" }) =>
      dealsApi.vote(id, type),
    onError: () => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Hãy đăng nhập để bình chọn.",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) =>
      deal?.isBookmarked ? dealsApi.removeBookmark(id) : dealsApi.bookmark(id),
    onSuccess: (_, _id) => {
      toast({
        title: deal?.isBookmarked ? "Đã bỏ lưu" : "Đã lưu deal!",
      });
      queryClient.invalidateQueries({ queryKey: ["deal", slug] });
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

  if (isLoading) return <DealDetailSkeleton />;

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link href="/deals">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">
              Không thể tải deal này
            </h2>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground">
              Deal có thể đã bị xóa hoặc không tồn tại. Hãy quay lại và thử deal
              khác.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.refresh()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
              <Button variant="outline" asChild>
                <Link href="/deals">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại danh sách
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) return null;

  const isHot = deal.score >= 80 || deal.upvoteCount >= 50;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
        <Link href="/deals">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image */}
          {deal.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-full object-cover"
                style={{ maxHeight: "400px" }}
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-orange-500 text-white">
              <ShoppingBag className="mr-1 h-3 w-3" />
              {platformLabels[deal.platform]}
            </Badge>
            {deal.category && (
              <Badge variant="secondary">{deal.category.name}</Badge>
            )}
            {isHot && (
              <Badge className="bg-red-500 text-white">
                <TrendingUp className="mr-1 h-3 w-3" />
                Hot
              </Badge>
            )}
            <Badge
              variant={
                deal.status === "APPROVED"
                  ? "default"
                  : deal.status === "PENDING"
                    ? "secondary"
                    : "destructive"
              }
            >
              {deal.status}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="font-jakarta text-2xl font-bold leading-tight sm:text-3xl">
            {deal.title}
          </h1>

          {/* Description */}
          {deal.description && (
            <p className="text-muted-foreground leading-relaxed">
              {deal.description}
            </p>
          )}

          {/* Price section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-jakarta text-4xl font-bold text-primary">
                {formatPrice(deal.salePrice, deal.currency)}
              </span>
              {deal.originalPrice > deal.salePrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(deal.originalPrice, deal.currency)}
                  </span>
                  <Badge variant="destructive" className="text-sm font-bold">
                    -{deal.discountPercent}%
                  </Badge>
                </>
              )}
            </div>

            {deal.couponCode && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1.5">
                  Mã giảm giá:
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-primary bg-primary/5 px-4 py-2">
                  <code className="font-mono text-lg font-bold text-primary">
                    {deal.couponCode}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(deal.couponCode!);
                      toast({ title: "Đã copy mã!" });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}

            <Button size="lg" className="mt-4 w-full" asChild>
              <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Mua ngay tại {platformLabels[deal.platform]}
              </a>
            </Button>
          </div>

          {/* Price history */}
          {deal.priceHistory && deal.priceHistory.length > 1 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-3">Lịch sử giá</h3>
              <div className="space-y-1">
                {deal.priceHistory
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatDate(entry.recordedAt)}
                      </span>
                      <span className="font-medium">
                        {formatPrice(entry.price, deal.currency)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Stats — editorial fact sheet */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông tin
            </p>
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  Lượt xem
                </dt>
                <dd className="font-medium tabular-nums">
                  {deal.viewCount >= 1000
                    ? `${(deal.viewCount / 1000).toFixed(1)}k`
                    : deal.viewCount}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Score
                </dt>
                <dd className="font-medium tabular-nums">{deal.score}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Đăng
                </dt>
                <dd className="text-sm text-muted-foreground">
                  {timeAgo(deal.createdAt)}
                </dd>
              </div>
              {deal.endDate && (
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Hết hạn
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    {formatDate(deal.endDate)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Community score */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cộng đồng đánh giá
            </p>
            <div className="flex gap-3">
              <button
                className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-950/30"
                onClick={() =>
                  user
                    ? voteMutation.mutate({ id: deal.id, type: "up" })
                    : toast({
                        variant: "destructive",
                        title: "Hãy đăng nhập",
                      })
                }
                aria-label={`Thích — ${deal.upvoteCount} lượt`}
              >
                <ThumbsUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold tabular-nums text-green-700 dark:text-green-400">
                  {deal.upvoteCount}
                </span>
                <span className="text-xs text-muted-foreground">Thích</span>
              </button>

              <button
                className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30"
                onClick={() =>
                  user
                    ? voteMutation.mutate({ id: deal.id, type: "down" })
                    : toast({
                        variant: "destructive",
                        title: "Hãy đăng nhập",
                      })
                }
                aria-label={`Không thích — ${deal.downvoteCount} lượt`}
              >
                <ThumbsDown className="h-5 w-5 text-red-500" />
                <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">
                  {deal.downvoteCount}
                </span>
                <span className="text-xs text-muted-foreground">Không</span>
              </button>
            </div>

            {isHydrated && user && (
              <Button
                variant={deal.isBookmarked ? "default" : "outline"}
                className="mt-3 w-full gap-1.5"
                onClick={() => bookmarkMutation.mutate(deal.id)}
              >
                <Bookmark
                  className={`h-4 w-4 ${deal.isBookmarked ? "fill-current" : ""}`}
                />
                {deal.isBookmarked ? "Đã lưu" : "Lưu deal"}
              </Button>
            )}

            <Button
              variant="outline"
              className="mt-2 w-full gap-1.5"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Đã copy link!" });
              }}
            >
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </Button>
          </div>

          {/* Source */}
          {deal.source && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nguồn
              </p>
              <p className="text-sm text-foreground">{deal.source.name}</p>
            </div>
          )}

          {/* Creator */}
          {deal.createdBy && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Người đăng
              </p>
              <p className="text-sm text-foreground">{deal.createdBy?.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DealDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-28 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Image */}
          <Skeleton className="w-full h-80 rounded-xl" />
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          {/* Title */}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-3/4" />
          {/* Description */}
          <Skeleton className="h-20 w-full" />
          {/* Price section */}
          <Skeleton className="h-40 rounded-xl" />
          {/* Price history */}
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
