// Integrated from the supplied hero-1 component. The structure is unchanged; changes are marked "fix:".
// - isolate on the section (else the -z-10 grid paints behind the section's own background)
// - a real eyebrow link; an optional children slot that replaces the single CTA button
// - colours from theme tokens: an ink-blue horizon, a dimmer dark mode (no white glare at night)
// - headline's faint end raised from /40 to /55: /40 measured 2.8:1, below WCAG AA for large text
// - shorter on phones so the content below the headline is on the first screen
// - no "use client": the hero has no state

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroProps {
  eyebrow?: string
  eyebrowHref?: string
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
  children?: React.ReactNode
}

export function Hero({
  eyebrow = "Innovate Without Limits",
  eyebrowHref = "#",
  title,
  subtitle,
  ctaLabel = "Explore Now",
  ctaHref = "#",
  children,
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative isolate mx-auto w-full pt-20 md:pt-40 px-6 text-center md:px-8
      md:min-h-[calc(100vh-40px)] overflow-hidden
      bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,var(--hero-end)_88%)]
      dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,var(--hero-end)_78%,var(--hero-glow)_99%)]
      rounded-b-xl"
    >
      {/* Grid BG */}
      <div
        className="absolute -z-10 inset-0 opacity-80 h-[600px] w-full
        bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)]
        bg-[size:6rem_5rem]
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Radial Accent: fix: the rim is the ink colour, like ink bleeding into paper */}
      <div
        className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)]
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%]
        -translate-x-1/2 rounded-[100%] bg-white dark:bg-black
        bg-[radial-gradient(closest-side,#fff_82%,var(--ink))]
        dark:bg-[radial-gradient(closest-side,#000_82%,var(--ink))]
        animate-fade-up"
      />

      {/* Eyebrow */}
      {eyebrow && (
        <a href={eyebrowHref} className="group inline-block rounded-3xl">
          <span
            className="text-sm text-gray-600 dark:text-gray-400 font-geist mx-auto px-5 py-2
            bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent
            border-[2px] border-gray-300/20 dark:border-white/5
            rounded-3xl w-fit tracking-tight uppercase flex items-center justify-center"
          >
            {eyebrow}
            <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>
      )}

      {/* Title */}
      <h1
        className="animate-fade-in -translate-y-4 text-balance
        bg-gradient-to-br from-black from-30% to-black/55
        bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter
        text-transparent opacity-0 sm:text-6xl md:text-7xl lg:text-8xl
        dark:from-white dark:to-white/55"
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-in mx-auto mb-12 max-w-2xl -translate-y-4 text-balance
        text-lg tracking-tight text-gray-600 dark:text-gray-400
        opacity-0 md:text-xl [animation-delay:120ms]"
      >
        {subtitle}
      </p>

      {/* CTA, or whatever the page puts in its place */}
      {children ? (
        <div className="relative z-20 animate-fade-in opacity-0 [animation-delay:240ms]">{children}</div>
      ) : (
        ctaLabel && (
          <div className="flex justify-center animate-fade-in opacity-0 [animation-delay:240ms]">
            <Button
              asChild
              className="mt-[-20px] w-fit md:w-52 z-20 font-geist tracking-tighter text-center text-lg"
            >
              <a href={ctaHref}>{ctaLabel}</a>
            </Button>
          </div>
        )
      )}

      {/* Bottom Fade */}
      <div
        className="animate-fade-up relative mt-28 md:mt-32 opacity-0 [perspective:2000px]
        after:absolute after:inset-0 after:z-50
        after:[background:linear-gradient(to_top,var(--background)_10%,transparent)]"
      />
    </section>
  )
}
