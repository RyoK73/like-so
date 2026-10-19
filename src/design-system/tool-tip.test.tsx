import { MyToolTip } from "@/design-system/tool-tip";
import { MyToolTipProvider } from "@/design-system/tool-tip-provider";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type ToolTipList = {
  paragraphMessage: string;
  hoverMessage: string;
};

const TOOLTIP_DELAY: number = 600;
const PROVIDER_TIMEOUT: number = 400;
let event: ReturnType<typeof userEvent.setup>;

const toolTipList: ToolTipList[] = [
  { paragraphMessage: "paragraph1", hoverMessage: "hover1" },
  { paragraphMessage: "paragraph2", hoverMessage: "hover2" },
];

const renderToolTipList = () => {
  render(
    <MyToolTipProvider>
      {toolTipList.map((tooltip, index) => (
        <MyToolTip side="top" message={tooltip.hoverMessage} key={index}>
          <p>{tooltip.paragraphMessage}</p>
        </MyToolTip>
      ))}
    </MyToolTipProvider>,
  );

  const firstParagraph = screen.getByText(toolTipList[0].paragraphMessage);
  const secondParagraph = screen.getByText(toolTipList[1].paragraphMessage);
  return { firstParagraph, secondParagraph };
};

const advanceTimerByTimeWithReact = (time: number) => {
  act(() => {
    vi.advanceTimersByTime(time);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  (globalThis as { jest?: unknown }).jest = {
    advanceTimersByTime: vi.advanceTimersByTime,
  };
  event = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime,
  });
});

afterEach(() => {
  vi.useRealTimers();
  delete (globalThis as { jest?: unknown }).jest;
});
it("should show the tooltip after 600ms", async () => {
  const { firstParagraph } = renderToolTipList();

  await event.hover(firstParagraph);
  advanceTimerByTimeWithReact(TOOLTIP_DELAY - 1);
  expect(
    screen.queryByText(toolTipList[0].hoverMessage),
  ).not.toBeInTheDocument();
  advanceTimerByTimeWithReact(2);
  expect(screen.getByText(toolTipList[0].hoverMessage)).toBeInTheDocument();
});

it("should show the next tooltip after 600ms when the element is hovered after 400ms", async () => {
  const { firstParagraph, secondParagraph } = renderToolTipList();

  await event.hover(firstParagraph);
  expect(
    screen.queryByText(toolTipList[0].hoverMessage),
  ).not.toBeInTheDocument();

  advanceTimerByTimeWithReact(TOOLTIP_DELAY);
  expect(screen.getByText(toolTipList[0].hoverMessage)).toBeInTheDocument();

  await event.unhover(firstParagraph);

  // second paragraph
  advanceTimerByTimeWithReact(PROVIDER_TIMEOUT + 1);
  await event.hover(secondParagraph);
  expect(
    screen.queryByText(toolTipList[1].hoverMessage),
  ).not.toBeInTheDocument();

  advanceTimerByTimeWithReact(TOOLTIP_DELAY - 1);
  expect(
    screen.queryByText(toolTipList[1].hoverMessage),
  ).not.toBeInTheDocument();

  advanceTimerByTimeWithReact(1);
  expect(screen.getByText(toolTipList[1].hoverMessage)).toBeInTheDocument();
});

it("should show the next tooltip instantly when the element is hovered within 400ms", async () => {
  const { firstParagraph, secondParagraph } = renderToolTipList();

  await event.hover(firstParagraph);
  advanceTimerByTimeWithReact(TOOLTIP_DELAY);
  expect(screen.getByText(toolTipList[0].hoverMessage)).toBeInTheDocument();

  await event.hover(secondParagraph);
  expect(screen.getByText(toolTipList[1].hoverMessage)).toBeInTheDocument();
});
