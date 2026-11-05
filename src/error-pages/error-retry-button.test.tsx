import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorRetryButton } from "@/error-pages/error-retry-button";

describe("ErrorRetryButton", () => {
  it("should render the retry button", () => {
    render(<ErrorRetryButton onRetry={vi.fn()} />);

    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("should call `onRetry` once when clicked", async () => {
    const event = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorRetryButton onRetry={onRetry} />);

    await event.click(screen.getByRole("button", { name: "再試行" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
