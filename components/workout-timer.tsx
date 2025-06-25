"use client";

import { AdvancedTimer } from "@/components/advanced-timer";
import { SimpleTimer } from "@/components/simple-timer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Settings } from "lucide-react";

export function WorkoutTimer() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple" className="flex items-center gap-2">
            <Dumbbell size={16} />
            Simple Timer
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings size={16} />
            Advanced Timer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-6">
          <SimpleTimer />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedTimer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
