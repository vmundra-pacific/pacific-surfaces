"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks = [
  { name: "Products", href: "/products" },
  { name: "Collections", href: "/collections" },
  { name: "Ecosurfaces", href: "/ecosurfaces" },
  { name: "Granites", href: "/granites" },
  { name: "Contact", href: "/contact" },
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center min-h-screen px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Search input */}
            <div className="w-full max-w-2xl mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search surfaces, collections..."
                  className={cn(
                    "w-full bg-transparent text-3xl font-light tracking-wide text-white placeholder-stone-500",
                    "border-b-2 border-stone-700 pb-4 outline-none transition-all duration-300",
                    "hover:border-stone-600 focus:border-white"
                  )}
                />
              </motion.div>
            </div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 text-center"
            >
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "relative text-stone-300 hover:text-white transition-colors duration-300 group",
                      "text-sm font-light tracking-wide uppercase"
                    )}
                  >
                    {link.name}
                    <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
