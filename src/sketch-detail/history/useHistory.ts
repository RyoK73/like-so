import { useState } from "react";
import { version } from "fabric";

type CanvasJson = {
  version: string;
  objects: unknown[];
};

type History = {
  future: CanvasJson[];
  present: CanvasJson;
  past: CanvasJson[];
};

const useHistory = () => {
  const [history, setHistory] = useState<History>({
    future: [],
    present: {
      version,
      objects: [],
    },
    past: [],
  });

  const redo = () => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const lastFutureValue = prev.future.at(-1);
      if (!lastFutureValue) return prev; // The prev.past.length === 1 ,even when set() called at once. So this if line will not pass.
      const newFutureArray = prev.future.slice(0, prev.future.length - 1);
      return {
        future: newFutureArray,
        present: lastFutureValue,
        past: [...prev.past, lastFutureValue],
      };
    });
  };

  const set = (newObject: CanvasJson) => {
    setHistory((prev) => ({
      future: [],
      present: newObject,
      past: [...prev.past, newObject],
    }));
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.past.length < 2) return prev;
      const pastWithoutLastValue = prev.past.slice(0, prev.past.length - 1);
      const pastLastValue = pastWithoutLastValue.at(-1);
      if (!pastLastValue) return prev; // The prev.past.length === 1 ,even when set() called at once. So this if line will not pass.
      return {
        future: [...prev.future, prev.present],
        present: pastLastValue,
        past: pastWithoutLastValue,
      };
    });
  };

  return { history, set, undo, redo };
};

export { useHistory };
export type { History, CanvasJson };
