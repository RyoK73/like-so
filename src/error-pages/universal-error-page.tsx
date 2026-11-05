"use client";

import { TriangleAlert } from "lucide-react";
import {
  ErrorLinkButton,
  ErrorPageLayout,
  ErrorRetryButton,
} from "@/error-pages";

const UniversalErrorPage = ({
  reset,
  href,
  buttonText,
}: {
  reset: () => void;
  href: string;
  buttonText: string;
}) => {
  return (
    <ErrorPageLayout
      title="問題が発生しました"
      description="時間をおいて、もう一度お試しください。"
      illustration={
        <TriangleAlert aria-hidden className="size-10 text-destructive" />
      }
      actions={
        <>
          <ErrorRetryButton onRetry={reset} />
          <ErrorLinkButton href={href}>{buttonText}</ErrorLinkButton>
        </>
      }
    />
  );
};

export { UniversalErrorPage };
