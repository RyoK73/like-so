import { MyToolTip } from "@/design-system/tool-tip";
import Link from "next/link";
import { LuUserRoundPlus } from "react-icons/lu";

const SignUpLink = () => {
  return (
    <MyToolTip key="signup" side="right" message="アカウント登録">
      <Link href={"/signup"} aria-label="アカウント登録">
        <LuUserRoundPlus />
      </Link>
    </MyToolTip>
  );
};

export { SignUpLink };
