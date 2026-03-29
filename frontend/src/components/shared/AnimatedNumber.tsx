"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedNumber({ value, formatter }: { value: number; formatter?: (value: number) => string }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => setDisplay(value), [value]);

  const text = formatter ? formatter(display) : display.toString();

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="font-data"
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}
