import { ReactNode } from "react";

export default function PlanetsIndex({ children }: { children: ReactNode }) {
  return (
    <div>
      <h1>Planets!</h1>
      <div>{children}</div>
    </div>
  );
}
