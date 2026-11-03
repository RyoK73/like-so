"use client";
import { LuMinus, LuPlus } from "react-icons/lu";
import { iconItemClassName } from "@/design-system/constants";
import { IconButton } from "@/design-system/icon-button";
import {
  NumberInput,
  type NumberInputIssue,
} from "@/design-system/number-input";
import { toast } from "@/design-system/toast";
import { TOOLTIP_SIDE } from "@/sketch-detail/control-toolbar/constants";
import {
  MAX_PERCENT,
  MIN_PERCENT,
  canZoomIn,
  canZoomOut,
  zoomToPercent,
} from "@/sketch-detail/viewport/viewportMath";

type ZoomControlsProps = {
  zoom: number;
  // The zoom of the fitted view. It is shown as 100%.
  initialZoom: number;
  disabled: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetZoom: (percent: number) => void;
};

// The issues share an id, so that the latest one replaces the previous one.
const ISSUE_TOAST_ID = "zoom-input-issue";

const showIssue = (issue: NumberInputIssue) => {
  if (issue.type === "clamped") {
    const isMin = issue.bound === "min";
    toast.add({
      type: "info",
      title: isMin
        ? `倍率は ${MIN_PERCENT}% 以上にできます。${MIN_PERCENT}% に設定されました。`
        : `倍率は ${MAX_PERCENT}% 以下にできます。${MAX_PERCENT}% に設定されました。`,
      id: ISSUE_TOAST_ID,
    });
    return;
  }
  toast.add({
    type: "warning",
    title: "数値を入力してください。",
    id: ISSUE_TOAST_ID,
  });
};

const ZoomControls = ({
  zoom,
  initialZoom,
  disabled,
  onZoomIn,
  onZoomOut,
  onSetZoom,
}: ZoomControlsProps) => {
  return (
    <>
      <IconButton
        label="縮小"
        side={TOOLTIP_SIDE}
        className={iconItemClassName}
        disabled={disabled || !canZoomOut(zoom, initialZoom)}
        onClick={onZoomOut}
      >
        <LuMinus />
      </IconButton>
      <div className="flex items-center gap-1">
        <NumberInput
          aria-label="倍率"
          value={zoomToPercent(zoom, initialZoom)}
          min={MIN_PERCENT}
          max={MAX_PERCENT}
          disabled={disabled}
          onCommit={onSetZoom}
          onIssue={showIssue}
        />
        <span aria-hidden className="select-none">
          %
        </span>
      </div>
      <IconButton
        label="拡大"
        side={TOOLTIP_SIDE}
        className={iconItemClassName}
        disabled={disabled || !canZoomIn(zoom, initialZoom)}
        onClick={onZoomIn}
      >
        <LuPlus />
      </IconButton>
    </>
  );
};

export { ZoomControls };
