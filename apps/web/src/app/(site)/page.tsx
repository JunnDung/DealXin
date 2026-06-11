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

const featureCategories = [
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

const CategoryIcon0 = featureCategories[0].icon;
const CategoryIcon1 = featureCategories[1].icon;
const CategoryIcon2 = featureCategories[2].icon;

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
        {/* Decorative oversized text — background element */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 select-none text-[clamp(8rem,20vw,16rem)] font-bold leading-none text-foreground/[0.03] dark:text-foreground/[0.04]"
        >
          XIN
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            {/* Left: Copy — left-aligned, breaking the centered axis */}
            <div className="space-y-7">
              <Badge variant="secondary" className="text-sm font-medium">
                Săn Deal Việt Nam
              </Badge>

              <h1 className="font-jakarta text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Không bỏ lỡ{" "}
                <span className="text-primary">
                  <span className="text-primary/70">bất kỳ</span>
                </span>
                <br />
                ưu đãi nào
              </h1>

              <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                DealXin tổng hợp deal, voucher và lỗi giá từ Shopee, Lazada,
                TikTok Shop. Tiết kiệm thời gian, nhận ưu đãi tốt nhất mỗi ngày.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="sm:w-auto" asChild>
                  <Link href="/deals">
                    Xem ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="sm:w-auto" asChild>
                  <Link href="/deals/new">Đăng deal mới →</Link>
                </Button>
              </div>
            </div>

            {/* Right: Stats — asymmetric layout, not a perfect grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              {/* Big featured stat */}
              <div className="col-span-2 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-jakarta text-3xl font-bold tabular-nums">
                      —
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tin khuyến mãi đã xác thực
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-jakarta text-xl font-bold tabular-nums">
                      —
                    </p>
                    <p className="text-xs text-muted-foreground">
                      cập nhật hàng ngày
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-600/10">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-jakarta text-xl font-bold tabular-nums">
                      —
                    </p>
                    <p className="text-xs text-muted-foreground">
                      deal đã xác thực
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Hot Deals ─── */}
      <section className="bg-secondary/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-jakarta text-2xl font-bold">Deal Hot Nhất</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Những ưu đãi được cộng đồng quan tâm nhất
              </p>
            </div>
            <Button variant="ghost" className="self-start sm:self-auto" asChild>
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
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <Skeleton className="aspect-[16/9] w-full" />
                  <div className="space-y-2 p-4">
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
              <Tag className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
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

      {/* ─── Feature categories — asymmetric, not 3 equal columns ─── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-jakarta text-2xl font-bold">
              Khám phá theo nhu cầu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tìm deal phù hợp với mục tiêu tiết kiệm của bạn
            </p>
          </div>
          const CategoryIcon0 = featureCategories[0].icon; const CategoryIcon1 =
          featureCategories[1].icon; const CategoryIcon2 =
          featureCategories[2].icon;
          {/* Asymmetric: center card wider than sides */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Left */}
            <Link
              href={featureCategories[0].href}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:shadow-sm sm:col-span-1"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CategoryIcon0 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{featureCategories[0].title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {featureCategories[0].description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Xem ngay
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Center — featured */}
            <Link
              href={featureCategories[1].href}
              className="group rounded-xl border-2 border-primary/30 bg-card p-6 transition-colors hover:border-primary/50 hover:shadow-md sm:col-span-1"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <CategoryIcon1 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{featureCategories[1].title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {featureCategories[1].description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Xem ngay
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Right */}
            <Link
              href={featureCategories[2].href}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:shadow-sm sm:col-span-1"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CategoryIcon2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{featureCategories[2].title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {featureCategories[2].description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Xem ngay
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA — editorial treatment ─── */}
      <section className="relative overflow-hidden bg-primary py-16">
        {/* Decorative receipt-style ruled lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
        >
          <div className="mx-auto max-w-4xl px-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-px bg-primary-foreground"
                style={{ marginTop: `${(i + 1) * 32}px` }}
              />
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          {/* Decorative numeral */}
          <p
            aria-hidden="true"
            className="mb-2 font-jakarta text-8xl font-black leading-none text-primary-foreground/20"
          >
            01
          </p>
          <h2 className="font-jakarta text-3xl font-bold text-primary-foreground sm:text-4xl">
            Chia sẻ deal, nhận phần thưởng
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-primary-foreground/80 leading-relaxed">
            Đăng deal bạn tìm được, giúp cộng đồng tiết kiệm thêm mỗi ngày.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold"
              asChild
            >
              <Link href="/auth/register">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/deals">Khám phá deal →</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
