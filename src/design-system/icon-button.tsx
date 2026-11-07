import type { ComponentProps } from "react";
import type { Side } from "@base-ui/react/internals/useAnchorPositioning";
import { Button } from "@/design-system/button";
import { MyToolTip } from "@/design-system/tool-tip";

type IconButtonProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size"
> & {
  label: string;
  tooltipHint?: string; // Shown after `label` in the tooltip only, such as a shortcut key. The accessible name stays `label`.
  side: Side;
};

const IconButton = ({
  label,
  tooltipHint,
  side,
  ...props
}: IconButtonProps) => {
  const tooltipMessage = tooltipHint ? `${label}(${tooltipHint})` : label;
  return (
    <MyToolTip message={tooltipMessage} side={side}>
      <Button variant="icon" aria-label={label} {...props} />
    </MyToolTip>
  );
};

export { IconButton };
