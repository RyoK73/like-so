"use client";

import { UniversalErrorPage } from "@/error-pages";

const Error = ({ reset }: { reset: () => void }) => {
  return (
    <UniversalErrorPage
      reset={reset}
      href="/sketches"
      buttonText="スケッチ一覧へ戻る"
    />
  );
};

export default Error;
