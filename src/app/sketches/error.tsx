"use client";

import { UniversalErrorPage } from "@/error-pages";

const ErrorPage = ({ reset }: { reset: () => void }) => {
  return (
    <UniversalErrorPage
      reset={reset}
      href="/sketches"
      buttonText="スケッチ一覧へ戻る"
    />
  );
};

export default ErrorPage;
