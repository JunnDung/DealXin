import { Tag } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Tag className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-vietnam text-xl font-bold">DealXin</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Nền tảng tổng hợp deal, voucher v\u00E0 l\u1ED7i gi\u00E1 t\u1EEB
              Shopee, Lazada, TikTok Shop.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold">Nền tảng</h4>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/deals?platform=SHOPEE", label: "Shopee" },
                { href: "/deals?platform=LAZADA", label: "Lazada" },
                { href: "/deals?platform=TIKTOK_SHOP", label: "TikTok Shop" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">DealXin</h4>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/deals?sortBy=hot", label: "Hot nhất" },
                { href: "/deals?sortBy=expiring", label: "Sắp hết hạn" },
                { href: "/deals?sortBy=discount", label: "Giảm nhiều nhất" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Người dùng</h4>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/auth/register", label: "Đăng ký" },
                { href: "/auth/login", label: "Đăng nhập" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/deals/new", label: "Đăng deal mới" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DealXin. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
