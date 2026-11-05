"use client";

import { Button } from "@/design-system/button";

const ErrorRetryButton = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Button type="button" onClick={onRetry}>
      再試行
    </Button>
  );
};

export { ErrorRetryButton };
