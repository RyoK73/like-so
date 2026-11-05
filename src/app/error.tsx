"use client";

import { UniversalErrorPage } from "@/error-pages";

const Error = ({ reset }: { reset: () => void }) => {
  return (
    <UniversalErrorPage reset={reset} href="/" buttonText="トップへ戻る" />
  );
};

export default Error;
