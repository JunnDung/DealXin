import { Tag } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      suppressHydrationWarning
      className="border-t border-border bg-background"
    >
      <div
        suppressHydrationWarning
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        {/* Top row: brand statement + platform quick links */}
        <div
          suppressHydrationWarning
          className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"
        >
          {/* Brand */}
          <div suppressHydrationWarning className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                suppressHydrationWarning
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm ring-1 ring-primary/20"
              >
                <Tag className="h-4 w-4 text-primary-foreground" />
                <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-background" />
              </div>
              <div
                suppressHydrationWarning
                className="flex items-baseline gap-0.5"
              >
                <span className="font-vietnam text-base font-bold tracking-tight text-foreground">
                  Deal
                </span>
                <span className="font-vietnam text-base font-bold tracking-tight text-primary">
                  Xin
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Tổng hợp deal, voucher và lỗi giá từ Shopee, Lazada, TikTok Shop.
              Cộng đồng săn deal Việt Nam.
            </p>
          </div>

          {/* Platform quick links — horizontal, not a column */}
          <div suppressHydrationWarning>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nền tảng
            </p>
            <div
              suppressHydrationWarning
              className="flex flex-wrap gap-x-6 gap-y-2"
            >
              {[
                { href: "/deals?platform=SHOPEE", label: "Shopee" },
                { href: "/deals?platform=LAZADA", label: "Lazada" },
                { href: "/deals?platform=TIKTOK_SHOP", label: "TikTok Shop" },
                { href: "/deals?sortBy=hot", label: "Hot nhất" },
                { href: "/deals/new", label: "Đăng deal mới" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: legal line */}
        <div
          suppressHydrationWarning
          className="mt-8 flex flex-col items-start gap-3 border-t border-border/50 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p suppressHydrationWarning className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DealXin. Tất cả quyền được bảo
            lưu.
          </p>
          <div suppressHydrationWarning className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Quyền riêng tư
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
