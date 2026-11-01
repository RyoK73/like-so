import { render, screen } from "@testing-library/react";
import { SketchError } from "@/sketch-detail/sketch-error";

it("should show the message as an alert and a link to `sketches`", () => {
  render(<SketchError message="エラーメッセージ" />);

  expect(screen.getByRole("alert")).toHaveTextContent("エラーメッセージ");
  expect(
    screen.getByRole("link", { name: "スケッチ一覧へ戻る" }),
  ).toHaveAttribute("href", "/sketches");
});
