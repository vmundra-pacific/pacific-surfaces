"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function WhatsAppFAB() {
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Delay entrance by 2 seconds
    const timer = setTimeout(() => setMounted(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const whatsappUrl =
    "https://api.whatsapp.com/send/?phone=917305477549&text=Hi%2C+I+am+interested+in+your+quartz+and+granite+surfaces.+Please+share+details+and+pricing&type=phone_number&app_absent=0";

  return (
    <>
      {mounted && (
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6,
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          {/* Pulsing background ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-[#25D366]/30"
          />

          {/* Main button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg transition-all duration-300",
              "hover:shadow-xl hover:shadow-[#25D366]/50"
            )}
          >
            {/* Official WhatsApp Logo */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 175.216 175.552"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M87.184 14.2c-40.487 0-73.395 32.908-73.395 73.396 0 12.938 3.379 25.5 9.792 36.627l-10.39 37.924 38.852-10.189a73.065 73.065 0 0035.141 8.96h.031c40.468 0 73.378-32.929 73.378-73.397 0-19.608-7.633-38.038-21.495-51.89C125.236 21.79 106.812 14.2 87.184 14.2zm0 134.16h-.026a60.863 60.863 0 01-31.023-8.506l-2.227-1.32-23.076 6.053 6.156-22.488-1.45-2.306a60.816 60.816 0 01-9.326-32.397c0-33.633 27.386-61.02 61.042-61.02 16.305 0 31.633 6.354 43.151 17.886 11.516 11.53 17.864 26.852 17.858 43.15-.006 33.654-27.402 61.047-61.079 61.047v-.099zm33.484-45.702c-1.837-.919-10.864-5.361-12.547-5.973-1.683-.613-2.907-.919-4.131.919-1.224 1.837-4.746 5.972-5.816 7.196-1.071 1.225-2.143 1.378-3.98.46-1.836-.92-7.753-2.858-14.771-9.113-5.46-4.868-9.147-10.883-10.217-12.72-1.071-1.838-.114-2.831.805-3.746.825-.822 1.837-2.143 2.756-3.214.918-1.071 1.224-1.837 1.837-3.061.612-1.225.306-2.296-.153-3.215-.46-.919-4.131-9.96-5.662-13.633-1.49-3.58-3.006-3.095-4.131-3.153-1.071-.052-2.296-.065-3.52-.065-1.224 0-3.214.46-4.898 2.296-1.683 1.837-6.429 6.283-6.429 15.322 0 9.04 6.583 17.773 7.502 18.997.918 1.225 12.956 19.775 31.39 27.735 4.384 1.893 7.806 3.022 10.474 3.868 4.402 1.398 8.407 1.2 11.574.728 3.531-.527 10.864-4.44 12.394-8.727 1.53-4.286 1.53-7.96 1.071-8.726-.459-.766-1.683-1.225-3.52-2.143z" />
            </svg>
          </motion.div>

          {/* Tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-stone-900 text-white text-xs font-light tracking-wide rounded-lg whitespace-nowrap shadow-lg"
            >
              Chat with us
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-stone-900 transform rotate-45" />
            </motion.div>
          )}
        </motion.a>
      )}
    </>
  );
}
