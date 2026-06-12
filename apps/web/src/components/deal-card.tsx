"use client";

import {
  Bookmark,
  Clock,
  ExternalLink,
  Eye,
  ShoppingBag,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DealResponse } from "@/lib/api";

interface DealCardProps {
  deal: DealResponse;
  onVote?: (type: "up" | "down") => void;
  onBookmark?: (isBookmarked: boolean) => void;
  voting?: boolean;
}

const platformLabels: Record<string, string> = {
  SHOPEE: "Shopee",
  LAZADA: "Lazada",
  TIKTOK_SHOP: "TikTok Shop",
  OTHER: "Khác",
};

const platformColors: Record<string, string> = {
  SHOPEE: "bg-orange-500",
  LAZADA: "bg-blue-500",
  TIKTOK_SHOP: "bg-pink-500",
  OTHER: "bg-slate-500",
};

function formatPrice(price: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 0) return `${diffD}ng`;
  if (diffH > 0) return `${diffH}h`;
  return "Vừa xong";
}

export function DealCard({
  deal,
  onVote,
  onBookmark,
  voting = false,
}: DealCardProps) {
  const [localUpvotes, setLocalUpvotes] = useState(deal.upvoteCount);
  const [_localDownvotes, setLocalDownvotes] = useState(deal.downvoteCount);
  const [hasVotedUp, setHasVotedUp] = useState(false);
  const [hasVotedDown, setHasVotedDown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVote = (type: "up" | "down") => {
    if (voting) return;
    if (type === "up") {
      if (hasVotedUp) {
        setLocalUpvotes((c) => c - 1);
        setHasVotedUp(false);
      } else {
        if (hasVotedDown) {
          setLocalDownvotes((c) => c - 1);
          setHasVotedDown(false);
        }
        setLocalUpvotes((c) => c + 1);
        setHasVotedUp(true);
      }
    } else {
      if (hasVotedDown) {
        setLocalDownvotes((c) => c - 1);
        setHasVotedDown(false);
      } else {
        if (hasVotedUp) {
          setLocalUpvotes((c) => c - 1);
          setHasVotedUp(false);
        }
        setLocalDownvotes((c) => c + 1);
        setHasVotedDown(true);
      }
    }
    onVote?.(type);
  };

  const handleCopy = () => {
    if (!deal.couponCode) return;
    navigator.clipboard.writeText(deal.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHot = deal.score >= 80 || localUpvotes >= 50;
  const isExpiring =
    deal.endDate && new Date(deal.endDate).getTime() - Date.now() < 86400000;

  const hasCoupon = !!deal.couponCode;
  const hasDiscount = deal.discountPercent > 0;

  return (
    <article
      className={[
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow",
        isHot && !hasCoupon
          ? "border-red-200 dark:border-red-900 shadow-sm"
          : hasCoupon
            ? "border-primary/20 shadow-sm"
            : "border-border hover:border-primary/30 hover:shadow-md",
      ].join(" ")}
    >
      {/* ── Image ── */}
      {deal.imageUrl && (
        <Link
          href={`/deals/${deal.slug}`}
          className="relative block overflow-hidden bg-muted"
          style={{ aspectRatio: "16/9" }}
        >
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute left-0 top-3 flex items-center gap-1 rounded-r-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
              <span>−{deal.discountPercent}%</span>
            </div>
          )}
          {/* Hot badge */}
          {isHot && (
            <div className="absolute right-0 top-3 flex items-center gap-1 rounded-l-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              <TrendingUp className="h-3 w-3" />
              <span>HOT</span>
            </div>
          )}
          {/* Expiring countdown strip */}
          {isExpiring && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 px-2 py-1 text-center text-xs font-semibold text-white">
              <Clock className="mr-1 inline-block h-3 w-3" />
              Sắp hết hạn — còn{" "}
              {Math.ceil(
                (new Date(deal.endDate!).getTime() - Date.now()) / 3600000,
              )}
              h
            </div>
          )}
        </Link>
      )}

      {/* ── Coupon strip (prominent only for coupon deals) ── */}
      {hasCoupon && (
        <div className="border-b border-dashed border-primary/30 bg-primary/5 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs font-semibold text-primary">
                MÃ
              </span>
              <code className="font-mono text-sm font-bold tracking-wider text-foreground">
                {deal.couponCode}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
              onClick={handleCopy}
            >
              {copied ? "✓ Đã copy" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Platform + meta row */}
        <div className="mb-2 flex items-center justify-between">
          <Badge
            className={`${platformColors[deal.platform]} border-0 text-white text-xs font-semibold`}
          >
            <ShoppingBag className="mr-1 h-2.5 w-2.5" />
            {platformLabels[deal.platform]}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {deal.viewCount > 0 && (
              <span className="flex items-center gap-0.5 tabular-nums">
                <Eye className="h-3 w-3" />
                {deal.viewCount >= 1000
                  ? `${(deal.viewCount / 1000).toFixed(1)}k`
                  : deal.viewCount}
              </span>
            )}
            <span className="flex items-center gap-0.5 tabular-nums">
              <Clock className="h-3 w-3" />
              {timeAgo(deal.createdAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/deals/${deal.slug}`} className="group/title mb-2 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary">
            {deal.title}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2">
          <span className="font-jakarta text-xl font-bold text-primary tabular-nums">
            {formatPrice(deal.salePrice, deal.currency)}
          </span>
          {deal.originalPrice > deal.salePrice && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {formatPrice(deal.originalPrice, deal.currency)}
            </span>
          )}
        </div>

        {/* Footer: community actions left, buy right */}
        <div className="mt-auto flex items-center justify-between pt-3">
          {/* Vote + bookmark — subtle */}
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={[
                    "flex h-7 items-center gap-1 rounded-md px-1.5 text-xs transition-colors",
                    hasVotedUp
                      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                  onClick={() => handleVote("up")}
                  disabled={voting}
                  aria-label="Thích deal này"
                >
                  <ThumbsUp
                    className={`h-3.5 w-3.5 ${hasVotedUp ? "fill-current" : ""}`}
                  />
                  <span className="tabular-nums">{localUpvotes}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Thích deal này</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={[
                    "flex h-7 items-center gap-1 rounded-md px-1.5 text-xs transition-colors",
                    hasVotedDown
                      ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                  onClick={() => handleVote("down")}
                  disabled={voting}
                  aria-label="Không thích"
                >
                  <ThumbsDown
                    className={`h-3.5 w-3.5 ${hasVotedDown ? "fill-current" : ""}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>Không thích</TooltipContent>
            </Tooltip>

            {onBookmark && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={[
                      "ml-0.5 flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors",
                      deal.isBookmarked
                        ? "text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                    onClick={() => onBookmark(!!deal.isBookmarked)}
                    aria-label={deal.isBookmarked ? "Bỏ lưu" : "Lưu deal"}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${deal.isBookmarked ? "fill-current" : ""}`}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {deal.isBookmarked ? "Bỏ lưu" : "Lưu deal"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Buy button — dominant */}
          <Button size="sm" className="gap-1.5 font-semibold" asChild>
            <a
              href={deal.sourceUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Mua tại ${platformLabels[deal.platform]}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Mua
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
