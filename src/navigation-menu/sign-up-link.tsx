import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuUserRoundPlus } from "react-icons/lu";

type SignUpLinkProps = {
  className?: string;
};

const SignUpLink = ({ className }: SignUpLinkProps) => {
  return (
    <MyToolTip side="right" message="アカウント登録">
      <Link href={"/signup"} aria-label="アカウント登録" className={className}>
        <LuUserRoundPlus />
      </Link>
    </MyToolTip>
  );
};

export { SignUpLink };
