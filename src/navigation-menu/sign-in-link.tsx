import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuLogIn } from "react-icons/lu";

type SignInLinkProps = {
  className?: string;
};

const SignInLink = ({ className }: SignInLinkProps) => {
  return (
    <MyToolTip side="right" message="サインイン">
      <Link href={"/signin"} aria-label="サインイン" className={className}>
        <LuLogIn />
      </Link>
    </MyToolTip>
  );
};

export { SignInLink };
