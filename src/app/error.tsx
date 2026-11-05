"use client";

import { UniversalErrorPage } from "@/error-pages";

const ErrorPage = ({ reset }: { reset: () => void }) => {
  return (
    <UniversalErrorPage reset={reset} href="/" buttonText="トップへ戻る" />
  );
};

export default ErrorPage;
