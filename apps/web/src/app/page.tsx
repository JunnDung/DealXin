import { Providers } from '~/components/providers';

export default function HomePage() {
  return (
    <Providers>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Kh\u00F4ng b\u1ECF l\u1EDD{' '}
              <span className="text-primary">b\u1EA5t k\u1EF3 \u0111\u00E2u n\u00E0o</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              DealXin t\u1ED5ng h\u1EE3p deal, voucher v\u00E0 flash sale t\u1EEB Shopee, Lazada, TikTok Shop.
              C\u1EADp nh\u1EADt li\u00EAn t\u1EE5c. Mi\u1EC5n ph\u00ED. Kh\u00F4ng qu\u1EA3ng c\u00E1o.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Theo d\u00F5i gi\u00E1',
                desc: 'C\u00F4ng c\u1EE5 theo d\u00F5i gi\u00E1 gi\u00FAp b\u1EA1n bi\u1EBFt khi n\u00E0o n\u00EAn mua.',
                href: '/track',
                cta: 'B\u1EAFt \u0111\u1EA7u theo d\u00F5i',
              },
              {
                title: 'Deal hot m\u1ED7i ng\u00E0y',
                desc: 'Top deal \u0111\u01B0\u1EE3c c\u1ED9ng \u0111\u1ED3ng b\u00ECnh ch\u1ECDn m\u1ED7i ng\u00E0y.',
                href: '/deals',
                cta: 'Xem deal hot',
              },
              {
                title: 'Bookmark \u0111\u1EC3 sau',
                desc: 'L\u01B0u deal y\u00EAu th\u00EDch \u0111\u1EC3 kh\u00F4ng b\u1ECF qu\u00EAn khi c\u1EA7n.',
                href: '/saved',
                cta: 'Xem bookmark',
              },
            ].map((card) => (
              <a
                key={card.title}
                href={card.href}
                className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
                <span className="mt-auto text-sm font-medium text-primary group-hover:underline">
                  {card.cta} \u2192
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </Providers>
  );
}
