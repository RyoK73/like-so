import {
  Canvas,
  Circle,
  FabricObject,
  FabricObjectProps,
  Point,
  Rect,
} from "fabric";
import { RefObject } from "react";
import {
  getNewShapeCenter,
  type Size,
} from "@/sketch-detail/viewport/viewportMath";

type ShapeType = "rect" | "circle";

type OptionalParameters = {
  fill: string;
  stroke: string;
  strokeWidth: number;
};

type Builder = (optionalParam: OptionalParameters) => FabricObject;

const commonParameters: Partial<FabricObjectProps> = {
  originX: "center",
  originY: "center",
  selectable: true,
};

const shapes: Record<ShapeType, Builder> = {
  rect: (optionalParam) =>
    new Rect({
      ...commonParameters,
      ...optionalParam,
      width: 200,
      height: 100,
    }),
  circle: (optionalParam) =>
    new Circle({ ...commonParameters, ...optionalParam, radius: 100 }),
};

const useShapes = (fabricCanvasRef: RefObject<Canvas | null>, frame: Size) => {
  const createShape = (
    type: ShapeType,
    fillColor: string = "transparent",
    strokeColor: string = "#2b2a28",
    strokeWidth: number = 10,
  ) => {
    const currentFabricCanvasRef = fabricCanvasRef.current;
    if (!currentFabricCanvasRef) return;
    const shape = shapes[type]({
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    });
    currentFabricCanvasRef.add(shape);
    // Put the shape at the center of the view, not at the center of the frame.
    const [zoom, , , , tx, ty] = currentFabricCanvasRef.viewportTransform;
    const center = getNewShapeCenter(
      { zoom, tx, ty },
      {
        width: currentFabricCanvasRef.getWidth(),
        height: currentFabricCanvasRef.getHeight(),
      },
      frame,
    );
    shape.setPositionByOrigin(
      new Point(center.x, center.y),
      "center",
      "center",
    );
    shape.setCoords();
  };

  return { createShape };
};

export { useShapes };
export type { ShapeType };
