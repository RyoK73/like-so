"use server";
import { revalidatePath } from "next/cache";

// Discard the client cache of the sketch list, so that going back to it shows the saved title, description and updated time.
const revalidateSketchList = async () => {
  revalidatePath("/sketches");
};

export { revalidateSketchList };
