"use client";
import { useTheme } from "next-themes";
import { LuSun, LuMoonStar } from "react-icons/lu";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/navigation-menu/constants";

const ThemeToggleButton = ({ className }: { className?: string }) => {
  const { setTheme, theme } = useTheme();

  return (
    <IconButton
      label="テーマ切り替え"
      side={TOOLTIP_SIDE}
      className={className}
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      <LuSun className="dark:hidden" />
      <LuMoonStar className="hidden dark:block" />
    </IconButton>
  );
};

export { ThemeToggleButton };
