// The SQLSTATE raised by the `sketches` count limit trigger.
const SKETCH_LIMIT_ERROR_CODE = "SK001";

// PostgREST errors carry the SQLSTATE in `code`; a plain `Error` does not.
const isSketchLimitError = (error: Error): boolean =>
  "code" in error && error.code === SKETCH_LIMIT_ERROR_CODE;

export { SKETCH_LIMIT_ERROR_CODE, isSketchLimitError };
