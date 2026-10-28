import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuUserRoundPlus } from "react-icons/lu";
import { TOOLTIP_SIDE } from "@/navigation-menu/constants";

type SignUpLinkProps = {
  className?: string;
};

const SignUpLink = ({ className }: SignUpLinkProps) => {
  return (
    <MyToolTip side={TOOLTIP_SIDE} message="アカウント登録">
      <Link href={"/signup"} aria-label="アカウント登録" className={className}>
        <LuUserRoundPlus />
      </Link>
    </MyToolTip>
  );
};

export { SignUpLink };
