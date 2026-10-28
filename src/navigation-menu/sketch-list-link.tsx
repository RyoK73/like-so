"use client";
import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuLibraryBig } from "react-icons/lu";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { TOOLTIP_SIDE } from "@/navigation-menu/constants";

type SketchListLinkProps = {
  className?: string;
};

const SketchListLink = ({ className }: SketchListLinkProps) => {
  const pathname = usePathname();
  return (
    <MyToolTip message="スケッチ一覧へ" side={TOOLTIP_SIDE}>
      <Link
        href="/sketches"
        aria-label="スケッチ一覧へ"
        className={cn(
          className,
          pathname === "/sketches" &&
            "bg-paint-yellow text-ink hover:bg-paint-yellow",
        )}
      >
        <LuLibraryBig />
      </Link>
    </MyToolTip>
  );
};

export { SketchListLink };
