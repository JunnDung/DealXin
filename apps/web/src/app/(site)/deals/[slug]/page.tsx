"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Clock,
  ExternalLink,
  Eye,
  Share2,
  ShoppingBag,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  if (isError) notFound();
  if (isLoading) return <DealDetailSkeleton />;
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
          {/* Stats */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{deal.viewCount} lượt xem</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>Score: {deal.score}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{timeAgo(deal.createdAt)}</span>
            </div>
            {deal.endDate && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Hết hạn: {formatDate(deal.endDate)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold">Bình chọn</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() =>
                  user
                    ? voteMutation.mutate({ id: deal.id, type: "up" })
                    : toast({ variant: "destructive", title: "Hãy đăng nhập" })
                }
              >
                <ThumbsUp className="h-4 w-4" />
                {deal.upvoteCount}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() =>
                  user
                    ? voteMutation.mutate({ id: deal.id, type: "down" })
                    : toast({ variant: "destructive", title: "Hãy đăng nhập" })
                }
              >
                <ThumbsDown className="h-4 w-4" />
                {deal.downvoteCount}
              </Button>
            </div>

            {isHydrated && user && (
              <Button
                variant={deal.isBookmarked ? "default" : "outline"}
                className="w-full gap-1.5"
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
              className="w-full gap-1.5"
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
              <p className="text-sm font-semibold mb-1">Nguồn</p>
              <p className="text-sm text-muted-foreground">
                {deal.source.name}
              </p>
            </div>
          )}

          {/* Creator */}
          {deal.creator && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-1">Người đăng</p>
              <p className="text-sm text-muted-foreground">
                {deal.creator.fullName}
              </p>
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
      <Skeleton className="h-9 w-24 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="w-full h-80 rounded-xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
