"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  ShieldCheck,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { DealCard } from "@/components/deal-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dealsApi } from "@/lib/api";

const stats = [
  {
    icon: Tag,
    label: "Tin khuyến mãi",
    value: "10,000+",
    color: "text-primary",
  },
  {
    icon: Zap,
    label: "Cập nhật mỗi ngày",
    value: "500+",
    color: "text-amber-500",
  },
  {
    icon: ShieldCheck,
    label: "Deal đã xác thực",
    value: "5,000+",
    color: "text-green-600",
  },
  {
    icon: TrendingUp,
    label: "Người theo dõi",
    value: "15,000+",
    color: "text-blue-500",
  },
];

const features = [
  {
    icon: TrendingUp,
    title: "Deal Hot Nhất",
    description:
      "Top deal được cộng đồng bình chọn cao nhất, cập nhật liên tục.",
    href: "/deals?sortBy=hot",
  },
  {
    icon: Clock,
    title: "Sắp Hết Hạn",
    description: "Những deal sắp hết hạn trong ngày, không bỏ lỡ cơ hội.",
    href: "/deals?sortBy=expiring",
  },
  {
    icon: Tag,
    title: "Giảm Nhiều Nhất",
    description:
      "Ưu đãi với mức giảm giá cao nhất từ các sàn thương mại điện tử.",
    href: "/deals?sortBy=discount",
  },
];

export default function HomePage() {
  const { data: hotDeals, isLoading } = useQuery({
    queryKey: ["deals", "hot"],
    queryFn: () => dealsApi.list({ sortBy: "hot", limit: 4 }),
    staleTime: 60 * 1000,
  });

  return (
    <div className="flex flex-col">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--primary)_1px,transparent_1px)] bg-[size:1px_80px] opacity-[0.06] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <div className="space-y-6">
              <Badge variant="secondary" className="text-sm font-medium">
                Săn Deal Việt Nam
              </Badge>
              <h1 className="font-jakarta text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Không bỏ lỡ <span className="text-primary">bất kỳ</span>
                <br />
                ưu đãi nào
              </h1>
              <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
                DealXin tổng hợp deal, voucher và lỗi giá từ Shopee, Lazada,
                TikTok Shop. Tiết kiệm thời gian, nhận ưu đãi tốt nhất mỗi ngày.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/deals">
                    Xem ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/deals/new">Đăng deal mới</Link>
                </Button>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
                  <p className="font-jakarta text-2xl font-bold">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Hot Deals ─── */}
      <section className="bg-secondary/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-jakarta text-2xl font-bold">Deal Hot Nhất</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Những ưu đãi được cộng đồng quan tâm nhất
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/deals?sortBy=hot">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <Skeleton className="aspect-[16/9] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotDeals && hotDeals.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hotDeals.data.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Tag className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Chưa có deal nào. Hãy là người đầu tiên!
              </p>
              <Button className="mt-4" asChild>
                <Link href="/deals/new">Đăng deal đầu tiên</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ─── Feature categories ─── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-jakarta text-2xl font-bold">
              Khám phá theo nhu cầu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tìm deal phù hợp với mục tiêu tiết kiệm của bạn
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map((feat) => (
              <Link
                key={feat.href}
                href={feat.href}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feat.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {feat.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                  Xem ngay
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-jakarta text-3xl font-bold text-primary-foreground sm:text-4xl">
            Chia sẻ deal, nhận phần thưởng
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Đăng deal bạn tìm được, giúp cộng đồng tiết kiệm thêm mỗi ngày.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/auth/register">
              Bắt đầu ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
