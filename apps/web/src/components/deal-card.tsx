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
  onBookmark?: () => void;
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
  const [localDownvotes, setLocalDownvotes] = useState(deal.downvoteCount);
  const [hasVotedUp, setHasVotedUp] = useState(false);
  const [hasVotedDown, setHasVotedDown] = useState(false);

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

  const isHot = deal.score >= 80 || localUpvotes >= 50;
  const isExpiring =
    deal.endDate && new Date(deal.endDate).getTime() - Date.now() < 86400000;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
      {/* Image */}
      {deal.imageUrl && (
        <Link
          href={`/deals/${deal.slug}`}
          className="relative block aspect-[16/9] overflow-hidden bg-muted"
        >
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {deal.discountPercent > 0 && (
            <div className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
              -{deal.discountPercent}%
            </div>
          )}
          {isHot && (
            <div className="absolute right-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              Hot
            </div>
          )}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-4">
        {/* Platform + meta */}
        <div className="mb-2 flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`${platformColors[deal.platform]} text-white border-0 text-xs`}
          >
            <ShoppingBag className="mr-1 h-2.5 w-2.5" />
            {platformLabels[deal.platform]}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {deal.viewCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {deal.viewCount}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {timeAgo(deal.createdAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/deals/${deal.slug}`} className="group/title">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary">
            {deal.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(deal.salePrice, deal.currency)}
          </span>
          {deal.originalPrice > deal.salePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(deal.originalPrice, deal.currency)}
            </span>
          )}
        </div>

        {/* Coupon */}
        {deal.couponCode && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <code className="rounded bg-accent px-1.5 py-0.5 text-xs font-mono font-medium text-accent-foreground">
              {deal.couponCode}
            </code>
          </div>
        )}

        {/* Expiring badge */}
        {isExpiring && (
          <div className="mt-2">
            <Badge variant="destructive" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Sắp hết hạn
            </Badge>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-1.5 text-xs ${
                    hasVotedUp ? "text-green-600" : "text-muted-foreground"
                  }`}
                  onClick={() => handleVote("up")}
                  disabled={voting}
                >
                  <ThumbsUp
                    className={`mr-1 h-3.5 w-3.5 ${hasVotedUp ? "fill-current" : ""}`}
                  />
                  {localUpvotes}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thích deal này</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-1.5 text-xs ${
                    hasVotedDown ? "text-red-500" : "text-muted-foreground"
                  }`}
                  onClick={() => handleVote("down")}
                  disabled={voting}
                >
                  <ThumbsDown
                    className={`mr-1 h-3.5 w-3.5 ${hasVotedDown ? "fill-current" : ""}`}
                  />
                  {localDownvotes}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Không thích</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            {onBookmark && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 ${
                      deal.isBookmarked
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={onBookmark}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${deal.isBookmarked ? "fill-current" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {deal.isBookmarked ? "Bỏ lưu" : "Lưu deal"}
                </TooltipContent>
              </Tooltip>
            )}

            <Button variant="default" size="sm" className="h-7" asChild>
              <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                Mua
              </a>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
