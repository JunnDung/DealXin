import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col">
      <Header />
      <main suppressHydrationWarning className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
