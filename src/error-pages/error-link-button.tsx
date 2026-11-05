import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/design-system/button";

const ErrorLinkButton = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  return (
    <Link href={href} className={buttonVariants({ variant: "outline" })}>
      {children}
    </Link>
  );
};

export { ErrorLinkButton };
