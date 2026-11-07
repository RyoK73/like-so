"use client";
import type { RefObject } from "react";
import type * as fabric from "fabric";
import { LuDownload } from "react-icons/lu";
import { iconItemClassName } from "@/design-system/constants";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/sketch-detail/handoff-toolbar/constants";
import { downloadImage } from "@/sketch-detail/handoff-toolbar/download-image-button/downloadImage";
import {
  exportFramePng,
  type Frame,
} from "@/sketch-detail/handoff-toolbar/exportFramePng";
import { getPaperColor } from "@/sketch-detail/handoff-toolbar/getPaperColor";

type DownloadImageButtonProps = {
  fabricCanvasRef: RefObject<fabric.Canvas | null>;
  frame: Frame;
  title: string;
  isLoaded: boolean;
};

const DownloadImageButton = ({
  fabricCanvasRef,
  frame,
  title,
  isLoaded,
}: DownloadImageButtonProps) => {
  const handleClick = () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    void downloadImage({
      title,
      now: new Date(),
      getBlob: () => exportFramePng(fabricCanvas, frame, getPaperColor()),
    });
  };

  return (
    <IconButton
      label="画像をダウンロード"
      side={TOOLTIP_SIDE}
      className={iconItemClassName}
      disabled={!isLoaded}
      onClick={handleClick}
    >
      <LuDownload />
    </IconButton>
  );
};

export { DownloadImageButton };
