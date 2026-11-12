"use client";

import { createContext, useContext, useMemo, useState, type Dispatch, type SetStateAction } from "react";

export type ChatterState = {
  open: boolean;
  expanded: boolean;
  minimized: boolean;
};

const chatterStateDefaultValue: ChatterState = {
  open: false,
  expanded: false,
  minimized: false,
};

type ChatterContextValue = {
  state: ChatterState;
  setState: Dispatch<SetStateAction<ChatterState>>;
};

const ChatterContext = createContext<ChatterContextValue | undefined>(undefined);

export function ChatterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatterState>(chatterStateDefaultValue);

  const value = useMemo(() => ({ state, setState }), [state]);

  return <ChatterContext.Provider value={value}>{children}</ChatterContext.Provider>;
}

export function useChatter() {
  const context = useContext(ChatterContext);

  if (!context) {
    throw new Error("useChatter must be used within a ChatterProvider");
  }

  return context;
}
