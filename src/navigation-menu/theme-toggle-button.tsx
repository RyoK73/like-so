"use client";
import { useTheme } from "next-themes";
import { LuSun, LuSunMoon } from "react-icons/lu";
import { MyToolTip } from "@/design-system/tool-tip";

const ThemeToggleButton = ({ className }: { className?: string }) => {
  const { setTheme, theme } = useTheme();

  return (
    <MyToolTip side="right" message="テーマ切り替え">
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
    </MyToolTip>
  );
};

export { ThemeToggleButton };
