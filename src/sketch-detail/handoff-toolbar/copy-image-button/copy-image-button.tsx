"use client";
import type { RefObject } from "react";
import type * as fabric from "fabric";
import { LuCopy } from "react-icons/lu";
import { iconItemClassName } from "@/design-system/constants";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/sketch-detail/handoff-toolbar/constants";
import { copyImage } from "@/sketch-detail/handoff-toolbar/copy-image-button/copyImage";
import {
  exportFramePng,
  type Frame,
} from "@/sketch-detail/handoff-toolbar/exportFramePng";
import { getPaperColor } from "@/sketch-detail/handoff-toolbar/getPaperColor";

type CopyImageButtonProps = {
  fabricCanvasRef: RefObject<fabric.Canvas | null>;
  frame: Frame;
  isLoaded: boolean;
};

const CopyImageButton = ({
  fabricCanvasRef,
  frame,
  isLoaded,
}: CopyImageButtonProps) => {
  const handleClick = () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    // `exportFramePng` draws synchronously, so the clipboard write starts inside the click.
    void copyImage(exportFramePng(fabricCanvas, frame, getPaperColor()));
  };

  return (
    <IconButton
      label="画像をコピー"
      side={TOOLTIP_SIDE}
      className={iconItemClassName}
      disabled={!isLoaded}
      onClick={handleClick}
    >
      <LuCopy />
    </IconButton>
  );
};

export { CopyImageButton };
