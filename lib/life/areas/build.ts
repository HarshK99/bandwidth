// Converts capacity into future value. Gets peak-energy slots.

import type { Area } from "../schema";
import { audience } from "./audience";
import { career } from "./career";
import { equity } from "./equity";
import { income } from "./income";

export const build = {
  id: "build",
  label: "Build",
  about:
    "Converts capacity into future value: income, equity, audience, career options. Gets peak-energy slots.",
  children: [income, equity, audience, career],
} as const satisfies Area;
