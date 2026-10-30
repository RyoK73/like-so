import { cn } from "cn";

const iconItemClassName =
  "inline-flex size-10 items-center justify-center rounded-xl bg-transparent text-foreground hover:bg-accent [&_svg:not([class*='size-'])]:size-5";

const floatingToolbarClassName =
  "bg-card border-2 border-foreground/60 shadow-float brush-a rotate-0";

const iconItemListClassName = cn(floatingToolbarClassName, "flex gap-2 p-2");

export { floatingToolbarClassName, iconItemClassName, iconItemListClassName };
