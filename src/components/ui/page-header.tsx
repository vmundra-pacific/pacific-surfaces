"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  dark?: boolean;
}

export function PageHeader({ badge, title, description, dark = false }: PageHeaderProps) {
  return (
    <section className={`relative overflow-hidden ${dark ? "bg-stone-950 text-white" : "bg-stone-50 text-stone-900"}`}>
      {/* Grain overlay */}
      {dark && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-16 relative z-10">
        {badge && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`inline-block text-xs font-medium tracking-[0.25em] uppercase mb-4 ${
              dark ? "text-stone-400" : "text-stone-500"
            }`}
          >
            {badge}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className={`mt-4 text-lg max-w-2xl font-light leading-relaxed ${
              dark ? "text-stone-400" : "text-stone-500"
            }`}
          >
            {description}
          </motion.p>
        )}
      </div>
      {/* Bottom gradient line */}
      <div className={`h-px ${dark ? "bg-gradient-to-r from-transparent via-stone-700/50 to-transparent" : "bg-gradient-to-r from-transparent via-stone-300/50 to-transparent"}`} />
    </section>
  );
}
