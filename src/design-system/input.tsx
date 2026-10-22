import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "brush-a h-16 w-full min-w-0 rotate-0 bg-card px-2.5 py-1 text-xl transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-xl dark:read-only:bg-muted dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
