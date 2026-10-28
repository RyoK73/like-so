import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuLogIn } from "react-icons/lu";
import { TOOLTIP_SIDE } from "@/navigation-menu/constants";

type SignInLinkProps = {
  className?: string;
};

const SignInLink = ({ className }: SignInLinkProps) => {
  return (
    <MyToolTip side={TOOLTIP_SIDE} message="サインイン">
      <Link href={"/signin"} aria-label="サインイン" className={className}>
        <LuLogIn />
      </Link>
    </MyToolTip>
  );
};

export { SignInLink };
