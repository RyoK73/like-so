import type { ReactNode } from "react";
import { cn } from "cn";
import { iconItemListClassName } from "@/design-system/constants";

// The card that floats at the bottom of the canvas. It only holds the controls, such as the shape buttons and the zoom controls.
const ControlToolbar = ({ children }: { children: ReactNode }) => {
  return (
    <div
      role="toolbar"
      aria-label="操作"
      className={cn(
        iconItemListClassName,
        "absolute bottom-4 left-1/2 z-10 -translate-x-1/2 items-center",
      )}
    >
      {children}
    </div>
  );
};

export { ControlToolbar };
