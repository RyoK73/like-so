import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberInput } from "@/design-system/number-input";

const LABEL = "number";

const renderInput = (value = 83) => {
  const onCommit = vi.fn();
  const onIssue = vi.fn();
  const view = render(
    <NumberInput
      aria-label={LABEL}
      value={value}
      min={10}
      max={400}
      onCommit={onCommit}
      onIssue={onIssue}
    />,
  );
  const rerenderWith = (nextValue: number) =>
    view.rerender(
      <NumberInput
        aria-label={LABEL}
        value={nextValue}
        min={10}
        max={400}
        onCommit={onCommit}
        onIssue={onIssue}
      />,
    );
  return { onCommit, onIssue, rerenderWith };
};

const getInput = () => screen.getByRole("textbox", { name: LABEL });

// Replace the text, and leave the input with Enter or blur.
const typeText = async (text: string) => {
  const user = userEvent.setup();
  const input = getInput();
  await user.clear(input);
  if (text !== "") await user.type(input, text);
  return { user, input };
};
const commitByEnter = async (text: string) => {
  const { user } = await typeText(text);
  await user.keyboard("{Enter}");
};
const commitByBlur = async (text: string) => {
  const { user } = await typeText(text);
  await user.tab();
};

describe("commit", () => {
  it("should show the value", () => {
    renderInput(83);

    expect(getInput()).toHaveValue("83");
  });

  it("should call `onCommit` once with the number when Enter is pressed", async () => {
    const { onCommit } = renderInput();

    await commitByEnter("150");

    expect(onCommit).toHaveBeenCalledExactlyOnceWith(150);
  });

  it("should call `onCommit` once with the number when the input is blurred", async () => {
    const { onCommit } = renderInput();

    await commitByBlur("150");

    expect(onCommit).toHaveBeenCalledExactlyOnceWith(150);
  });

  it("should not call `onCommit` while the user is typing", async () => {
    const { onCommit } = renderInput();

    await typeText("150");

    expect(onCommit).not.toHaveBeenCalled();
  });

  it("should discard the text and show the value when Escape is pressed", async () => {
    const { onCommit } = renderInput(83);
    const { user, input } = await typeText("150");

    await user.keyboard("{Escape}");

    expect(input).toHaveValue("83");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it.each([
    ["Enter", commitByEnter],
    ["blur", commitByBlur],
  ])(
    "should not call `onCommit` when the text is the same as the value (%s)",
    async (_name, commit) => {
      const { onCommit } = renderInput(83);

      await commit("83");

      expect(onCommit).not.toHaveBeenCalled();
    },
  );
});

describe("rounding and trimming", () => {
  it("should round a decimal to the same integer as the value and not call `onCommit`", async () => {
    const { onCommit } = renderInput(83);

    await commitByEnter("83.4");

    expect(onCommit).not.toHaveBeenCalled();
  });

  it.each([
    ["150.4", 150],
    ["150.5", 151],
  ])("should round %j to %j", async (text, expected) => {
    const { onCommit } = renderInput();

    await commitByEnter(text);

    expect(onCommit).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it("should trim the spaces around the text", async () => {
    const { onCommit } = renderInput();

    await commitByEnter(" 150 ");

    expect(onCommit).toHaveBeenCalledExactlyOnceWith(150);
  });
});

describe("range", () => {
  it.each([[10], [400]])(
    "should commit the boundary %j as it is without an issue",
    async (boundary) => {
      const { onCommit, onIssue } = renderInput();

      await commitByEnter(String(boundary));

      expect(onCommit).toHaveBeenCalledExactlyOnceWith(boundary);
      expect(onIssue).not.toHaveBeenCalled();
    },
  );

  it.each([[9], [0], [-5]])(
    "should clamp %j to the min and report it",
    async (raw) => {
      const { onCommit, onIssue } = renderInput();

      await commitByEnter(String(raw));

      expect(onCommit).toHaveBeenCalledExactlyOnceWith(10);
      expect(onIssue).toHaveBeenCalledExactlyOnceWith({
        type: "clamped",
        raw,
        clampedTo: 10,
        bound: "min",
      });
    },
  );

  it.each([[401], [99999]])(
    "should clamp %j to the max and report it",
    async (raw) => {
      const { onCommit, onIssue } = renderInput();

      await commitByEnter(String(raw));

      expect(onCommit).toHaveBeenCalledExactlyOnceWith(400);
      expect(onIssue).toHaveBeenCalledExactlyOnceWith({
        type: "clamped",
        raw,
        clampedTo: 400,
        bound: "max",
      });
    },
  );
});

describe("invalid text", () => {
  it("should show the value, not commit, and report `empty` for an empty text", async () => {
    const { onCommit, onIssue } = renderInput(83);

    await commitByEnter("");

    expect(getInput()).toHaveValue("83");
    expect(onCommit).not.toHaveBeenCalled();
    expect(onIssue).toHaveBeenCalledExactlyOnceWith({ type: "empty" });
  });

  it.each([["abc"], ["150%"]])(
    "should show the value, not commit, and report `not-a-number` for %j",
    async (raw) => {
      const { onCommit, onIssue } = renderInput(83);

      await commitByEnter(raw);

      expect(getInput()).toHaveValue("83");
      expect(onCommit).not.toHaveBeenCalled();
      expect(onIssue).toHaveBeenCalledExactlyOnceWith({
        type: "not-a-number",
        raw,
      });
    },
  );
});

describe("follow the value", () => {
  it("should show the new value when the value changes while not editing", () => {
    const { rerenderWith } = renderInput(83);

    rerenderWith(120);

    expect(getInput()).toHaveValue("120");
  });

  it("should overwrite the text and keep the focus when the value changes while editing", async () => {
    const { rerenderWith } = renderInput(83);
    const { input } = await typeText("15");

    rerenderWith(120);

    expect(input).toHaveValue("120");
    expect(input).toHaveFocus();
  });

  it("should not call `onCommit` when Enter is pressed right after the value changes", async () => {
    const { onCommit, rerenderWith } = renderInput(83);
    const { user } = await typeText("15");
    rerenderWith(120);

    await user.keyboard("{Enter}");

    expect(onCommit).not.toHaveBeenCalled();
  });
});
