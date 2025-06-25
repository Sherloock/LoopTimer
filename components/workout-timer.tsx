"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
	Clock,
	Dumbbell,
	Minus,
	Pause,
	Play,
	Plus,
	RotateCcw,
	Square,
	Timer
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TimerState = "idle" | "running" | "paused" | "completed";
type TimerType = "workout" | "rest" | "custom";

interface TimerConfig {
  workoutTime: number;
  restTime: number;
  rounds: number;
  customTime: number;
}

export function WorkoutTimer() {
  const [config, setConfig] = useState<TimerConfig>({
    workoutTime: 45,
    restTime: 15,
    rounds: 8,
    customTime: 300,
  });

  const [state, setState] = useState<TimerState>("idle");
  const [currentType, setCurrentType] = useState<TimerType>("workout");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [activeTab, setActiveTab] = useState("workout");

  // Initialize timer based on active tab
  useEffect(() => {
    if (state === "idle") {
      switch (activeTab) {
        case "workout":
          setTimeLeft(config.workoutTime);
          setCurrentType("workout");
          break;
        case "custom":
          setTimeLeft(config.customTime);
          setCurrentType("custom");
          break;
      }
      setCurrentRound(1);
    }
  }, [activeTab, config, state]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (state === "running" && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [state, timeLeft]);

  const handleTimerComplete = () => {
    if (activeTab === "workout") {
      if (currentType === "workout") {
        // Switch to rest
        setCurrentType("rest");
        setTimeLeft(config.restTime);
        toast.success("Rest time! Take a breather.");
      } else if (currentType === "rest") {
        // Check if more rounds
        if (currentRound < config.rounds) {
          setCurrentType("workout");
          setTimeLeft(config.workoutTime);
          setCurrentRound((prev) => prev + 1);
          toast.success(`Round ${currentRound + 1} - Let's go!`);
        } else {
          // Workout complete
          setState("completed");
          toast.success("🎉 Workout Complete! Great job!");
        }
      }
    } else {
      // Custom timer complete
      setState("completed");
      toast.success("⏰ Timer Complete!");
    }
  };

  const startTimer = () => {
    setState("running");
    toast.info("Timer started!");
  };

  const pauseTimer = () => {
    setState("paused");
    toast.info("Timer paused");
  };

  const resetTimer = () => {
    setState("idle");
    setCurrentRound(1);
    toast.info("Timer reset");
  };

  const stopTimer = () => {
    setState("idle");
    setCurrentRound(1);
    toast.info("Timer stopped");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (activeTab === "workout") {
      const totalTime = currentType === "workout" ? config.workoutTime : config.restTime;
      return ((totalTime - timeLeft) / totalTime) * 100;
    } else {
      return ((config.customTime - timeLeft) / config.customTime) * 100;
    }
  };

  const updateConfig = (field: keyof TimerConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: Math.max(1, value) }));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Workout Timer
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Custom Timer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Interval Workout Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Badge
                    variant={currentType === "workout" ? "default" : "secondary"}
                    className="text-lg px-4 py-2"
                  >
                    {currentType === "workout" ? "WORK" : "REST"}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Round {currentRound}/{config.rounds}
                  </Badge>
                </div>

                <div className={cn(
                  "text-8xl font-mono font-bold timer-display",
                  state === "running" && timeLeft <= 5 && "text-destructive pulse-animation"
                )}>
                  {formatTime(timeLeft)}
                </div>

                <Progress value={getProgress()} className="h-3" />
              </div>

              {/* Configuration */}
              {state === "idle" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workoutTime">Work Time (seconds)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("workoutTime", config.workoutTime - 5)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="workoutTime"
                        type="number"
                        value={config.workoutTime}
                        onChange={(e) => updateConfig("workoutTime", parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("workoutTime", config.workoutTime + 5)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restTime">Rest Time (seconds)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("restTime", config.restTime - 5)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="restTime"
                        type="number"
                        value={config.restTime}
                        onChange={(e) => updateConfig("restTime", parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("restTime", config.restTime + 5)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rounds">Rounds</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("rounds", config.rounds - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="rounds"
                        type="number"
                        value={config.rounds}
                        onChange={(e) => updateConfig("rounds", parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("rounds", config.rounds + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-3">
                {state === "idle" && (
                  <Button onClick={startTimer} size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Start
                  </Button>
                )}

                {state === "running" && (
                  <Button onClick={pauseTimer} variant="secondary" size="lg" className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}

                {state === "paused" && (
                  <>
                    <Button onClick={startTimer} size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Resume
                    </Button>
                    <Button onClick={resetTimer} variant="outline" size="lg" className="gap-2">
                      <RotateCcw className="h-5 w-5" />
                      Reset
                    </Button>
                  </>
                )}

                {(state === "running" || state === "paused") && (
                  <Button onClick={stopTimer} variant="destructive" size="lg" className="gap-2">
                    <Square className="h-5 w-5" />
                    Stop
                  </Button>
                )}

                {state === "completed" && (
                  <Button onClick={resetTimer} size="lg" className="gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Start New Workout
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Custom Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center space-y-4">
                <div className={cn(
                  "text-8xl font-mono font-bold timer-display",
                  state === "running" && timeLeft <= 5 && "text-destructive pulse-animation"
                )}>
                  {formatTime(timeLeft)}
                </div>

                <Progress value={getProgress()} className="h-3" />
              </div>

              {/* Configuration */}
              {state === "idle" && (
                <div className="flex justify-center">
                  <div className="space-y-2 w-64">
                    <Label htmlFor="customTime">Timer Duration (seconds)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("customTime", config.customTime - 30)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="customTime"
                        type="number"
                        value={config.customTime}
                        onChange={(e) => updateConfig("customTime", parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateConfig("customTime", config.customTime + 30)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-3">
                {state === "idle" && (
                  <Button onClick={startTimer} size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Start
                  </Button>
                )}

                {state === "running" && (
                  <Button onClick={pauseTimer} variant="secondary" size="lg" className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}

                {state === "paused" && (
                  <>
                    <Button onClick={startTimer} size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Resume
                    </Button>
                    <Button onClick={resetTimer} variant="outline" size="lg" className="gap-2">
                      <RotateCcw className="h-5 w-5" />
                      Reset
                    </Button>
                  </>
                )}

                {(state === "running" || state === "paused") && (
                  <Button onClick={stopTimer} variant="destructive" size="lg" className="gap-2">
                    <Square className="h-5 w-5" />
                    Stop
                  </Button>
                )}

                {state === "completed" && (
                  <Button onClick={resetTimer} size="lg" className="gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Start New Timer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}