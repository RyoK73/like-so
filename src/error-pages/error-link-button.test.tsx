import { render, screen } from "@testing-library/react";
import { ErrorLinkButton } from "@/error-pages/error-link-button";

describe("ErrorLinkButton", () => {
  it("should render a link with the given name and `href`", () => {
    render(<ErrorLinkButton href="/">トップへ戻る</ErrorLinkButton>);

    expect(screen.getByRole("link", { name: "トップへ戻る" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("should use another `href` when given", () => {
    render(
      <ErrorLinkButton href="/sketches">スケッチ一覧へ戻る</ErrorLinkButton>,
    );

    expect(
      screen.getByRole("link", { name: "スケッチ一覧へ戻る" }),
    ).toHaveAttribute("href", "/sketches");
  });
});
