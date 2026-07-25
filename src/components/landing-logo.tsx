interface LandingLogoProps {
  className?: string
  iconSize?: number
  variant?: "light" | "dark" | "auto"
}

export function LandingLogo({ className = "", iconSize = 28, variant = "light" }: LandingLogoProps) {
  const textColorClass =
    variant === "light"
      ? "text-white"
      : variant === "dark"
      ? "text-zinc-900 dark:text-white"
      : "text-foreground"

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Bespoke Resort Monogram Crest - Theme Responsive */}
      <div className="relative size-8 sm:size-9 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary shadow-md group-hover:scale-105 transition-transform shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-4.5 sm:size-5 text-primary stroke-[1.75]"
        >
          {/* Luxury Crown Monogram Crest */}
          <path d="M4 18L5.5 8L9.5 12L12 5L14.5 12L18.5 8L20 18H4Z" stroke="currentColor" strokeLinejoin="round" />
          <circle cx="12" cy="4" r="1" fill="currentColor" />
          <circle cx="4" cy="7" r="1" fill="currentColor" />
          <circle cx="20" cy="7" r="1" fill="currentColor" />
          <path d="M7 21H17" stroke="currentColor" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-serif text-lg sm:text-xl tracking-[0.18em] sm:tracking-[0.2em] font-bold uppercase leading-none ${textColorClass}`}>
          SunRise
        </span>
        <span className="hidden sm:block text-[8.5px] font-black tracking-[0.28em] text-primary uppercase mt-1">
          Resort & Spa • Ocean Sanctuary
        </span>
      </div>
    </div>
  )
}
