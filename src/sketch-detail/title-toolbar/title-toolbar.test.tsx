import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { TitleToolbar } from "@/sketch-detail/title-toolbar/title-toolbar";
import { dateTimeTestHelper } from "@/sketch-list/testUtility";

const { generateTestDateTime } = dateTimeTestHelper();
const UPDATED_AT = "2026-10-02T00:00:00Z";

const renderToolbar = (
  props: Partial<ComponentProps<typeof TitleToolbar>> = {},
) =>
  render(
    <TitleToolbar
      title="my sketch"
      description="my description"
      width={1920}
      height={1080}
      updatedAt={UPDATED_AT}
      {...props}
    />,
  );

it("should render the title, description, size and updated_at", () => {
  renderToolbar();

  expect(screen.getByRole("heading")).toHaveTextContent("my sketch");
  expect(screen.getByText("my description")).toBeInTheDocument();
  expect(screen.getByText("1920 × 1080")).toBeInTheDocument();
  expect(
    screen.getByText(generateTestDateTime(new Date(UPDATED_AT))),
  ).toBeInTheDocument();
});

it("should expose the full title via the title attribute", () => {
  renderToolbar({ title: "a very long sketch title" });

  expect(screen.getByRole("heading")).toHaveAttribute(
    "title",
    "a very long sketch title",
  );
});

it("should not render the description when it is an empty string", () => {
  renderToolbar({ description: "" });

  expect(screen.queryByText("my description")).not.toBeInTheDocument();
  expect(document.querySelectorAll("p")).toHaveLength(1);
});

it("should not render the description when it is only whitespace", () => {
  renderToolbar({ description: "   " });

  expect(document.querySelectorAll("p")).toHaveLength(1);
});

it("should render the minimum size 320 × 320", () => {
  renderToolbar({ width: 320, height: 320 });

  expect(screen.getByText("320 × 320")).toBeInTheDocument();
});
