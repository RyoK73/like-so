import { render, screen } from "@testing-library/react";
import { ErrorPageLayout } from "@/error-pages/error-page-layout";

const TITLE = "テスト見出し";
const DESCRIPTION = "テスト説明";
const ACTION = "テスト操作";
const ILLUSTRATION = "テストイラスト";

describe("ErrorPageLayout", () => {
  it("should render `title` as the h1 and `actions`", () => {
    render(
      <ErrorPageLayout title={TITLE} actions={<button>{ACTION}</button>} />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ACTION })).toBeInTheDocument();
  });

  it("should render `description` when given", () => {
    render(
      <ErrorPageLayout
        title={TITLE}
        description={DESCRIPTION}
        actions={<button>{ACTION}</button>}
      />,
    );

    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
  });

  it("should not render the description element when `description` is omitted", () => {
    render(
      <ErrorPageLayout title={TITLE} actions={<button>{ACTION}</button>} />,
    );

    expect(screen.queryByText(DESCRIPTION)).not.toBeInTheDocument();
  });

  it("should render `illustration` when given", () => {
    render(
      <ErrorPageLayout
        title={TITLE}
        actions={<button>{ACTION}</button>}
        illustration={<span>{ILLUSTRATION}</span>}
      />,
    );

    expect(screen.getByText(ILLUSTRATION)).toBeInTheDocument();
  });

  it("should not render the illustration slot when `illustration` is omitted", () => {
    render(
      <ErrorPageLayout title={TITLE} actions={<button>{ACTION}</button>} />,
    );

    expect(screen.queryByText(ILLUSTRATION)).not.toBeInTheDocument();
  });
});
