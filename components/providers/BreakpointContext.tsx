"use client";

import { createContext } from "react";
import type { BreakpointKey } from "@/lib/breakpoints";

export const BreakpointContext = createContext<BreakpointKey>("desktop");


