"use server";
import { revalidatePath } from "next/cache";

// Discard the client cache of the sketch list, so that going back to it shows the saved title, description and updated time.
const revalidateSketchList = async () => {
  try {
    revalidatePath("/sketches");
  } catch {
    // Not awaited. The save already succeeded, so a failure here is ignored.
    // TODO(#70): Log the failure according to the policy decided in #70.
  }
};

export { revalidateSketchList };
