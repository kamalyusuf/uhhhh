import { type ReactNode } from "react";

export const AbsoluteCenter = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center"
    }}
  >
    {children}
  </div>
);
