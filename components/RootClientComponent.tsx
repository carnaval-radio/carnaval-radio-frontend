"use client";

import { Suspense } from "react";
import { RootClientComponentInner } from "./RootClientComponentInner";

export function RootClientComponent({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <RootClientComponentInner>{children}</RootClientComponentInner>
    </Suspense>
  );
}
