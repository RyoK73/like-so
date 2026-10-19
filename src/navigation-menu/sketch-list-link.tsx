"use client";
import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuLibraryBig } from "react-icons/lu";
import { usePathname } from "next/navigation";
import { cn } from "cn";

type SketchListLinkProps = {
  className?: string;
};

const SketchListLink = ({ className }: SketchListLinkProps) => {
  const pathname = usePathname();
  return (
    <MyToolTip message="スケッチ一覧へ" side="right">
      <Link
        href="/sketches"
        aria-label="スケッチ一覧へ"
        className={cn(
          className,
          pathname === "/sketches" &&
            "bg-ds-primary text-ds-ink hover:bg-ds-primary",
        )}
      >
        <LuLibraryBig />
      </Link>
    </MyToolTip>
  );
};

export { SketchListLink };
