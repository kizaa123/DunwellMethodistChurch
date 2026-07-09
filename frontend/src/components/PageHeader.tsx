interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(212,51%,18%) 0%, hsl(212,51%,26%) 50%, hsl(220,40%,22%) 100%)",
      }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "hsl(41,74%,47%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {badge && (
          <p
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full animate-slide-down"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "hsl(41,74%,60%)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {badge}
          </p>
        )}

        <h1
          className="font-serif text-3xl sm:text-5xl font-bold text-white mb-4 animate-slide-up text-balance"
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-blue-100/80 max-w-2xl mx-auto text-lg leading-relaxed animate-slide-up text-balance"
            style={{ animationDelay: "80ms" }}
          >
            {subtitle}
          </p>
        )}

        <div
          className="mt-5 h-0.5 w-12 rounded-full mx-auto animate-slide-up"
          style={{
            background: "linear-gradient(90deg, hsl(41,74%,47%), hsl(41,74%,60%))",
            animationDelay: "140ms",
          }}
        />
      </div>
    </section>
  );
}
