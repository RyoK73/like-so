"use client";
import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuLibraryBig } from "react-icons/lu";
import { usePathname } from "next/navigation";

const SketchListLink = () => {
  const pathname = usePathname();
  return (
    <MyToolTip key="SketchListLink" message="スケッチ一覧へ" side="right">
      <Link
        href="/sketches"
        aria-label="スケッチ一覧へ"
        className={pathname === "/sketches" ? "primary-text-light" : ""}
      >
        <LuLibraryBig />
      </Link>
    </MyToolTip>
  );
};

export { SketchListLink };
