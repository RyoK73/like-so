import { cn } from "cn";
import { navigationMenuInsetClassName } from "@/design-system/constants";
import { SketchList } from "@/sketch-list";

const page = () => {
  return (
    <div
      className={cn(
        navigationMenuInsetClassName,
        "mx-auto flex w-full max-w-3xl flex-col gap-6 py-12 pr-6",
      )}
    >
      <h1 className="text-2xl font-semibold tracking-tight">スケッチ</h1>
      <SketchList />
    </div>
  );
};

export default page;
