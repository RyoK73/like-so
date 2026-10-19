import { Tooltip } from "@base-ui/react";
import { ReactElement } from "react";
import type { Side } from "@base-ui/react/internals/useAnchorPositioning";

type Props = {
  message: string;
  children: ReactElement;
  side: Side;
  sideOffset?: number;
};

const MyToolTip = ({ message, children, side, sideOffset = 8 }: Props) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner
          side={side}
          sideOffset={sideOffset}
          className="z-20"
        >
          <Tooltip.Popup className="relative rounded-xl bg-ds-surface-raised px-3 py-2 text-sm leading-[1.2] font-medium text-ds-on-surface">
            <Tooltip.Arrow className="size-2 rotate-45 bg-ds-surface-raised data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1" />
            {message}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export { MyToolTip };
