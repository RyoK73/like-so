import { Tooltip } from "@base-ui/react";
import { ReactNode } from "react";

const MyToolTipProvider = ({ children }: { children: ReactNode }) => {
  return <Tooltip.Provider>{children}</Tooltip.Provider>;
};

export { MyToolTipProvider };
