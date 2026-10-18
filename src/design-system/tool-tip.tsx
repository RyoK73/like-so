import { Tooltip } from "@base-ui/react";
import { ReactNode } from "react";
import type { Side } from "@base-ui/react/internals/useAnchorPositioning";

type Props = {
  message: string;
  children: ReactNode;
  side: Side;
  sideOffset?: number;
};

const MyToolTip = ({ message, children, side, sideOffset = 5 }: Props) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={sideOffset}>
          <Tooltip.Popup>{message}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export { MyToolTip };
