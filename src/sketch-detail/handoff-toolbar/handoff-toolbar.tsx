import type { RefObject } from "react";
import type * as fabric from "fabric";
import { cn } from "cn";
import { iconItemListClassName } from "@/design-system/constants";
import { CopyImageButton } from "@/sketch-detail/handoff-toolbar/copy-image-button/copy-image-button";
import { DownloadImageButton } from "@/sketch-detail/handoff-toolbar/download-image-button/download-image-button";
import type { Frame } from "@/sketch-detail/handoff-toolbar/exportFramePng";

type HandoffToolbarProps = {
  fabricCanvasRef: RefObject<fabric.Canvas | null>;
  frame: Frame;
  title: string;
  isLoaded: boolean;
};

// The card that floats at the right edge of the canvas. It holds the buttons that hand the sketch over to LLMs and other people, such as copy and download.
const HandoffToolbar = ({
  fabricCanvasRef,
  frame,
  title,
  isLoaded,
}: HandoffToolbarProps) => {
  return (
    <div
      role="toolbar"
      aria-label="受け渡し"
      className={cn(
        iconItemListClassName,
        "absolute top-1/2 right-4 z-10 -translate-y-1/2 flex-col",
      )}
    >
      <CopyImageButton
        fabricCanvasRef={fabricCanvasRef}
        frame={frame}
        isLoaded={isLoaded}
      />
      <DownloadImageButton
        fabricCanvasRef={fabricCanvasRef}
        frame={frame}
        title={title}
        isLoaded={isLoaded}
      />
    </div>
  );
};

export { HandoffToolbar };
