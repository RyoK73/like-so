"use client";
import { useTheme } from "next-themes";
import { LuSun, LuSunMoon } from "react-icons/lu";

const ThemeToggleButton = ({ className }: { className?: string }) => {
  const { setTheme, theme } = useTheme();

  return (
    <button
      type="button"
      aria-label="テーマ切り替え"
      className={className}
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      <LuSun className="dark:hidden" />
      <LuSunMoon className="hidden dark:block" />
    </button>
  );
};

export { ThemeToggleButton };
