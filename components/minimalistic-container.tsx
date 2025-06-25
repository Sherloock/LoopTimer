import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface MinimalisticContainerProps {
  children: ReactNode;
}

export function MinimalisticContainer({
  children,
}: MinimalisticContainerProps) {
  return (
    <Card className="relative flex min-h-[80vh] flex-col">
      <CardContent className="relative flex flex-1 flex-col justify-center overflow-hidden pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
