import type { ComponentProps } from "react";
import type { Side } from "@base-ui/react/internals/useAnchorPositioning";
import { Button } from "@/design-system/button";
import { MyToolTip } from "@/design-system/tool-tip";

type IconButtonProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size"
> & {
  label: string;
  side: Side;
};

const IconButton = ({ label, side, ...props }: IconButtonProps) => {
  return (
    <MyToolTip message={label} side={side}>
      <Button variant="icon" aria-label={label} {...props} />
    </MyToolTip>
  );
};

export { IconButton };
