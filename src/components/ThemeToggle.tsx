'use client'

import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl hover:scale-110 transition-transform"
      aria-label="Toggle theme"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
