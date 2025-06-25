"use client";

import { MinimalisticContainer } from "@/components/minimalistic-container";
import { MinimalisticTimerView } from "@/components/minimalistic-timer-view";
import { TimerControls } from "@/components/timer-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { StatCard } from "@/components/ui/stat-card";
import { useTimerState } from "@/hooks/use-timer-state";
import { formatTime, getProgress, timerToasts } from "@/lib/timer-utils";
import {
  getIntervalTypeForDisplay,
  mapIntervalTypeToTimerType,
  TimerType,
} from "@/utils/timer-shared";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Repeat,
  Settings,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface IntervalStep {
  id: string;
  name: string;
  duration: number;
  type: "prepare" | "work" | "rest";
}

interface LoopGroup {
  id: string;
  name: string;
  loops: number;
  items: WorkoutItem[];
  collapsed?: boolean;
  skipLast?: boolean;
}

type WorkoutItem = IntervalStep | LoopGroup;

interface ColorSettings {
  prepare: string;
  work: string;
  rest: string;
  loop: string;
  nestedLoop: string;
}

interface AdvancedConfig {
  items: WorkoutItem[];
  sets: number;
  colors: ColorSettings;
}

// Helper functions
const isLoop = (item: WorkoutItem): item is LoopGroup => {
  return "loops" in item && "items" in item;
};

const isInterval = (item: WorkoutItem): item is IntervalStep => {
  return "duration" in item && "type" in item;
};

// Simple Checkbox Component
function Checkbox({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
  );
}

// Droppable Zone Component
function DroppableZone({
  id,
  children,
  className = "",
  isOver = false,
  style,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  isOver?: boolean;
  style?: React.CSSProperties;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "border-dashed border-blue-300 bg-blue-50" : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Sortable Item Component
function SortableItem({
  item,
  onUpdate,
  onRemove,
  onToggleCollapse,
  onAddToLoop,
  activeId,
  isNested = false,
  colors,
}: {
  item: WorkoutItem;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
  onToggleCollapse?: (id: string) => void;
  onAddToLoop?: (loopId: string) => void;
  activeId: string | null | undefined;
  isNested?: boolean;
  colors: ColorSettings;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActiveDropTarget = activeId && activeId !== item.id && isLoop(item);

  // Get colors based on item type
  const getItemColors = () => {
    if (isLoop(item)) {
      return {
        borderColor: isNested ? colors.nestedLoop : colors.loop,
        bgColor: isNested ? `${colors.nestedLoop}20` : `${colors.loop}20`,
      };
    } else {
      return {
        borderColor: colors[item.type],
        bgColor: `${colors[item.type]}20`,
      };
    }
  };

  const { borderColor, bgColor } = getItemColors();

  if (isLoop(item)) {
    return (
      <div ref={setNodeRef} style={style} className="space-y-2">
        <DroppableZone
          id={`drop-${item.id}`}
          isOver={Boolean(isActiveDropTarget)}
          className={`rounded-lg border-2 border-dashed p-3 ${
            isActiveDropTarget ? "border-blue-400 bg-blue-100" : ""
          }`}
          style={{
            borderColor: isActiveDropTarget ? "#3b82f6" : borderColor,
            backgroundColor: isActiveDropTarget ? "#dbeafe" : bgColor,
          }}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCollapse?.(item.id)}
              className="h-6 w-6 p-0"
            >
              {item.collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>

            <Repeat size={16} style={{ color: borderColor }} />

            <Input
              value={item.name}
              onChange={(e) => onUpdate(item.id, "name", e.target.value)}
              className="flex-1"
              placeholder="Loop name"
            />

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">×</span>
              <NumberInput
                value={item.loops}
                onChange={(value) => onUpdate(item.id, "loops", value)}
                min={1}
                step={1}
                className="w-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id={`skip-last-${item.id}`}
                checked={Boolean(item.skipLast)}
                onCheckedChange={(checked) =>
                  onUpdate(item.id, "skipLast", checked)
                }
              />
              <Label htmlFor={`skip-last-${item.id}`} className="text-sm">
                Skip last
              </Label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToLoop?.(item.id)}
              className="gap-1"
            >
              <Plus size={12} />
              Add
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 size={16} />
            </Button>

            <div {...attributes} {...listeners} className="cursor-grab">
              <GripVertical size={16} className="text-gray-400" />
            </div>
          </div>
        </DroppableZone>

        {!item.collapsed && item.items.length > 0 && (
          <div className="ml-4 space-y-2">
            <SortableContext
              items={item.items.map((subItem) => subItem.id)}
              strategy={verticalListSortingStrategy}
            >
              {item.items.map((subItem) => (
                <SortableItem
                  key={subItem.id}
                  item={subItem}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onToggleCollapse={onToggleCollapse}
                  onAddToLoop={onAddToLoop}
                  activeId={activeId}
                  isNested={true}
                  colors={colors}
                />
              ))}
            </SortableContext>
          </div>
        )}

        {!item.collapsed && item.items.length === 0 && (
          <DroppableZone
            id={`empty-${item.id}`}
            className="ml-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center text-muted-foreground dark:border-gray-600 dark:bg-gray-800"
          >
            Drop intervals or loops here
          </DroppableZone>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor,
        backgroundColor: bgColor,
      }}
      className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
        isNested ? "border-opacity-60" : ""
      }`}
    >
      <Input
        value={item.name}
        onChange={(e) => onUpdate(item.id, "name", e.target.value)}
        className="flex-1"
        placeholder="Exercise name"
      />

      <NumberInput
        value={item.duration}
        onChange={(value) => onUpdate(item.id, "duration", value)}
        min={1}
        step={5}
        className="w-32"
      />

      <select
        value={item.type}
        onChange={(e) => onUpdate(item.id, "type", e.target.value)}
        className="rounded-md border px-3 py-2 text-sm"
      >
        <option value="prepare">Prepare</option>
        <option value="work">Work</option>
        <option value="rest">Rest</option>
      </select>

      <Button variant="outline" size="icon" onClick={() => onRemove(item.id)}>
        <Trash2 size={16} />
      </Button>

      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical size={16} className="text-gray-400" />
      </div>
    </div>
  );
}

export function AdvancedTimer() {
  const [config, setConfig] = useState<AdvancedConfig>({
    items: [
      { id: "1", name: "PREPARE", duration: 10, type: "prepare" },
      { id: "2", name: "WORK", duration: 45, type: "work" },
      { id: "3", name: "REST", duration: 15, type: "rest" },
    ],
    sets: 3,
    colors: {
      prepare: "#f97316", // orange
      work: "#22c55e", // green
      rest: "#3b82f6", // blue
      loop: "#8b5cf6", // purple
      nestedLoop: "#f59e0b", // amber
    },
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<TimerType>("prepare");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const {
    state,
    currentSet,
    setCurrentSet,
    isHolding,
    holdProgress,
    startTimer: baseStartTimer,
    pauseTimer,
    resetTimer: baseResetTimer,
    stopTimer: baseStopTimer,
    handleHoldStart: baseHoldStart,
    handleHoldEnd,
    setCompleted,
  } = useTimerState();

  // Memoized flatten function with safeguards
  const flattenedIntervals = useMemo(() => {
    const MAX_INTERVALS = 1000; // Prevent memory crashes
    const MAX_RECURSION_DEPTH = 10; // Prevent infinite recursion

    const getFlattenedIntervals = (
      items: WorkoutItem[],
      parentLoopInfo?: any,
      depth: number = 0,
    ): Array<
      IntervalStep & {
        originalIndex: number;
        loopInfo?: {
          loopName: string;
          iteration: number;
          intervalIndex: number;
          parentLoop?: any;
        };
      }
    > => {
      // Prevent infinite recursion
      if (depth > MAX_RECURSION_DEPTH) {
        console.warn("Maximum recursion depth reached in loop structure");
        return [];
      }

      const flattened: Array<
        IntervalStep & {
          originalIndex: number;
          loopInfo?: {
            loopName: string;
            iteration: number;
            intervalIndex: number;
            parentLoop?: any;
          };
        }
      > = [];

      items.forEach((item, index) => {
        // Check if we're approaching memory limit
        if (flattened.length > MAX_INTERVALS) {
          console.warn(
            "Maximum interval limit reached to prevent memory crash",
          );
          return;
        }

        if (isInterval(item)) {
          flattened.push({ ...item, originalIndex: index });
        } else if (isLoop(item)) {
          // Limit loop iterations to prevent exponential growth
          const maxLoops = Math.min(item.loops, 50); // Cap at 50 iterations

          for (let loop = 1; loop <= maxLoops; loop++) {
            const subItems = getFlattenedIntervals(
              item.items,
              {
                loopName: item.name,
                iteration: loop,
                skipLast: item.skipLast,
                parentLoop: parentLoopInfo,
              },
              depth + 1,
            );

            // Apply skip last logic - remove last rest if skipLast is true
            let processedItems = subItems;
            if (item.skipLast && loop === maxLoops && subItems.length > 0) {
              // Find the last rest interval and remove it
              for (let i = processedItems.length - 1; i >= 0; i--) {
                if (processedItems[i].type === "rest") {
                  processedItems = processedItems
                    .slice(0, i)
                    .concat(processedItems.slice(i + 1));
                  break;
                }
              }
            }

            processedItems.forEach((subItem, subIndex) => {
              if (flattened.length < MAX_INTERVALS) {
                flattened.push({
                  ...subItem,
                  originalIndex: index,
                  loopInfo: {
                    loopName: item.name,
                    iteration: loop,
                    intervalIndex: subIndex,
                    parentLoop: parentLoopInfo,
                  },
                });
              }
            });
          }
        }
      });

      return flattened;
    };

    try {
      return getFlattenedIntervals(config.items);
    } catch (error) {
      console.error("Error flattening intervals:", error);
      return [];
    }
  }, [config.items]); // Only recalculate when items change

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Memoized utility functions
  const findItemById = useCallback(
    (items: WorkoutItem[], id: string): WorkoutItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (isLoop(item)) {
          const found = findItemById(item.items, id);
          if (found) return found;
        }
      }
      return null;
    },
    [],
  );

  const removeItemById = useCallback(
    (items: WorkoutItem[], id: string): WorkoutItem[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => {
          if (isLoop(item)) {
            return { ...item, items: removeItemById(item.items, id) };
          }
          return item;
        });
    },
    [],
  );

  const addItemToLoop = useCallback(
    (
      items: WorkoutItem[],
      loopId: string,
      newItem: WorkoutItem,
    ): WorkoutItem[] => {
      return items.map((item) => {
        if (item.id === loopId && isLoop(item)) {
          return { ...item, items: [...item.items, newItem] };
        }
        if (isLoop(item)) {
          return { ...item, items: addItemToLoop(item.items, loopId, newItem) };
        }
        return item;
      });
    },
    [],
  );

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeIdStr = active.id as string;
      const overIdStr = over.id as string;

      // Handle dropping into a loop
      if (overIdStr.startsWith("drop-") || overIdStr.startsWith("empty-")) {
        const targetLoopId = overIdStr
          .replace("drop-", "")
          .replace("empty-", "");
        const activeItem = findItemById(config.items, activeIdStr);

        if (activeItem && targetLoopId !== activeIdStr) {
          setConfig((prev) => ({
            ...prev,
            items: addItemToLoop(
              removeItemById(prev.items, activeIdStr),
              targetLoopId,
              activeItem,
            ),
          }));
        }
        return;
      }

      // Handle reordering
      if (activeIdStr !== overIdStr) {
        setConfig((prev) => {
          const oldIndex = prev.items.findIndex(
            (item) => item.id === activeIdStr,
          );
          const newIndex = prev.items.findIndex(
            (item) => item.id === overIdStr,
          );

          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...prev,
              items: arrayMove(prev.items, oldIndex, newIndex),
            };
          }

          return prev;
        });
      }
    },
    [config.items, findItemById, removeItemById, addItemToLoop],
  );

  // Initialize timer - only when state changes to idle
  useEffect(() => {
    if (state === "idle") {
      if (flattenedIntervals.length > 0) {
        setTimeLeft(flattenedIntervals[0].duration);
        setCurrentType(mapIntervalTypeToTimerType(flattenedIntervals[0].type));
        setCurrentItemIndex(0);
      }
      setCurrentSet(1);
    }
  }, [state]); // Remove config dependency to prevent constant recalculation

  // Separate effect for config changes
  useEffect(() => {
    if (state === "idle" && flattenedIntervals.length > 0) {
      setTimeLeft(flattenedIntervals[0].duration);
      setCurrentType(mapIntervalTypeToTimerType(flattenedIntervals[0].type));
      setCurrentItemIndex(0);
    }
  }, [flattenedIntervals]); // Only when flattened intervals change

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
  }, [state, timeLeft]); // Keep this as is

  const handleTimerComplete = useCallback(() => {
    const nextIndex = currentItemIndex + 1;

    if (nextIndex < flattenedIntervals.length) {
      const nextInterval = flattenedIntervals[nextIndex];
      setCurrentItemIndex(nextIndex);
      setCurrentType(mapIntervalTypeToTimerType(nextInterval.type));
      setTimeLeft(nextInterval.duration);

      const intervalName = nextInterval.loopInfo
        ? `${nextInterval.loopInfo.loopName} (${nextInterval.loopInfo.iteration}) - ${nextInterval.name}`
        : nextInterval.name;

      timerToasts.nextInterval(intervalName);
    } else {
      if (currentSet < config.sets) {
        setCurrentSet((prev) => prev + 1);
        setCurrentItemIndex(0);
        const firstInterval = flattenedIntervals[0];
        setCurrentType(mapIntervalTypeToTimerType(firstInterval.type));
        setTimeLeft(firstInterval.duration);
        timerToasts.nextInterval(
          `Set ${currentSet + 1} - ${firstInterval.name}`,
        );
      } else {
        setCompleted("🎉 Advanced Workout Complete! Great job!");
      }
    }
  }, [
    currentItemIndex,
    flattenedIntervals,
    currentSet,
    config.sets,
    setCurrentSet,
    setCompleted,
  ]);

  const resetState = useCallback(() => {
    setCurrentSet(1);
    setCurrentItemIndex(0);
  }, [setCurrentSet]);

  const startTimer = useCallback(
    () => baseStartTimer("Advanced Timer started!"),
    [baseStartTimer],
  );
  const resetTimer = useCallback(
    () => baseResetTimer(resetState),
    [baseResetTimer, resetState],
  );
  const stopTimer = useCallback(
    () => baseStopTimer(resetState),
    [baseStopTimer, resetState],
  );
  const handleHoldStart = useCallback(
    () => baseHoldStart(stopTimer),
    [baseHoldStart, stopTimer],
  );

  // Memoized calculations
  const totalSessionTime = useMemo(() => {
    if (flattenedIntervals.length === 0) return 0;
    const timePerSet = flattenedIntervals.reduce(
      (sum, interval) => sum + interval.duration,
      0,
    );
    return config.sets * timePerSet;
  }, [flattenedIntervals, config.sets]);

  const overallProgress = useMemo(() => {
    if (state === "idle" || state === "completed") return 0;

    const totalIntervals = config.sets * flattenedIntervals.length;
    if (totalIntervals === 0) return 0;

    const completedIntervals =
      (currentSet - 1) * flattenedIntervals.length + currentItemIndex;

    let currentIntervalProgress = 0;
    if (
      flattenedIntervals.length > 0 &&
      currentItemIndex < flattenedIntervals.length
    ) {
      const currentInterval = flattenedIntervals[currentItemIndex];
      currentIntervalProgress =
        getProgress(currentInterval.duration, timeLeft) / 100;
    }

    return Math.min(
      100,
      ((completedIntervals + currentIntervalProgress) / totalIntervals) * 100,
    );
  }, [
    state,
    config.sets,
    flattenedIntervals,
    currentSet,
    currentItemIndex,
    timeLeft,
  ]);

  const totalTimeRemaining = useMemo(() => {
    if (state === "idle" || state === "completed") return 0;

    let remaining = timeLeft;

    // Add remaining intervals in current set
    for (let i = currentItemIndex + 1; i < flattenedIntervals.length; i++) {
      remaining += flattenedIntervals[i].duration;
    }

    // Add remaining sets
    const remainingSets = config.sets - currentSet;
    if (remainingSets > 0) {
      const timePerSet = flattenedIntervals.reduce(
        (sum, interval) => sum + interval.duration,
        0,
      );
      remaining += remainingSets * timePerSet;
    }

    return remaining;
  }, [
    state,
    timeLeft,
    currentItemIndex,
    flattenedIntervals,
    config.sets,
    currentSet,
  ]);

  // Item management functions with useCallback for performance
  const addInterval = useCallback(() => {
    const newInterval: IntervalStep = {
      id: Date.now().toString(),
      name: "NEW EXERCISE",
      duration: 30,
      type: "work",
    };
    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, newInterval],
    }));
  }, []);

  const addLoop = useCallback(() => {
    const newLoop: LoopGroup = {
      id: Date.now().toString(),
      name: "NEW LOOP",
      loops: 3,
      items: [],
      collapsed: false,
      skipLast: false,
    };
    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, newLoop],
    }));
  }, []);

  const addToLoop = useCallback(
    (loopId: string) => {
      const newInterval: IntervalStep = {
        id: Date.now().toString(),
        name: "NEW EXERCISE",
        duration: 30,
        type: "work",
      };

      setConfig((prev) => ({
        ...prev,
        items: addItemToLoop(prev.items, loopId, newInterval),
      }));
    },
    [addItemToLoop],
  );

  const removeItem = useCallback(
    (id: string) => {
      setConfig((prev) => ({
        ...prev,
        items: removeItemById(prev.items, id),
      }));
    },
    [removeItemById],
  );

  const updateItem = useCallback((id: string, field: string, value: any) => {
    const updateRecursive = (items: WorkoutItem[]): WorkoutItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === "duration" ? Math.max(1, Number(value)) : value,
          };
        }
        if (isLoop(item)) {
          return {
            ...item,
            items: updateRecursive(item.items),
          };
        }
        return item;
      });
    };

    setConfig((prev) => ({
      ...prev,
      items: updateRecursive(prev.items),
    }));
  }, []);

  const toggleLoopCollapse = useCallback((id: string) => {
    const toggleRecursive = (items: WorkoutItem[]): WorkoutItem[] => {
      return items.map((item) => {
        if (isLoop(item) && item.id === id) {
          return { ...item, collapsed: !item.collapsed };
        }
        if (isLoop(item)) {
          return {
            ...item,
            items: toggleRecursive(item.items),
          };
        }
        return item;
      });
    };

    setConfig((prev) => ({
      ...prev,
      items: toggleRecursive(prev.items),
    }));
  }, []);

  const getCurrentIntervalName = useCallback(() => {
    if (
      flattenedIntervals.length > 0 &&
      currentItemIndex < flattenedIntervals.length
    ) {
      const current = flattenedIntervals[currentItemIndex];
      if (current.loopInfo) {
        return `${current.loopInfo.loopName} (${current.loopInfo.iteration}) - ${current.name}`;
      }
      return current.name;
    }
    return "INTERVAL";
  }, [flattenedIntervals, currentItemIndex]);

  const getTimerProgress = useCallback(() => {
    if (
      flattenedIntervals.length > 0 &&
      currentItemIndex < flattenedIntervals.length
    ) {
      const currentInterval = flattenedIntervals[currentItemIndex];
      return getProgress(currentInterval.duration, timeLeft);
    }
    return 0;
  }, [flattenedIntervals, currentItemIndex, timeLeft]);

  const fastForward = useCallback(() => {
    if (
      state === "idle" ||
      state === "completed" ||
      flattenedIntervals.length === 0
    )
      return;
    if (timeLeft > 0) {
      setTimeLeft(0);
      timerToasts.fastForward("Skipped to end of interval");
    }
  }, [state, flattenedIntervals.length, timeLeft]);

  const fastBackward = useCallback(() => {
    if (
      state === "idle" ||
      state === "completed" ||
      flattenedIntervals.length === 0
    )
      return;

    const currentInterval = flattenedIntervals[currentItemIndex];
    if (currentInterval && timeLeft < currentInterval.duration) {
      setTimeLeft(currentInterval.duration);
      timerToasts.fastBackward("Jumped to start of interval");
    }
  }, [state, flattenedIntervals, currentItemIndex, timeLeft]);

  // Color settings handlers
  const updateColor = useCallback(
    (colorType: keyof ColorSettings, color: string) => {
      setConfig((prev) => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorType]: color,
        },
      }));
    },
    [],
  );

  const resetColors = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      colors: {
        prepare: "#f97316", // orange
        work: "#22c55e", // green
        rest: "#3b82f6", // blue
        loop: "#8b5cf6", // purple
        nestedLoop: "#f59e0b", // amber
      },
    }));
  }, []);

  const isMinimalisticView = state === "running" || state === "paused";

  // Add warning for excessive loops/nesting
  const showPerformanceWarning = useMemo(() => {
    return (
      flattenedIntervals.length > 500 ||
      config.items.some((item) => isLoop(item) && item.loops > 20)
    );
  }, [flattenedIntervals.length, config.items]);

  return (
    <div className="relative space-y-6">
      {showPerformanceWarning && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
          <div className="text-sm text-yellow-800">
            ⚠️ Warning: Large workout detected ({flattenedIntervals.length}{" "}
            total steps). Consider reducing loop counts or nesting depth for
            better performance.
          </div>
        </div>
      )}

      {isMinimalisticView && (
        <MinimalisticContainer>
          <MinimalisticTimerView
            timeLeft={timeLeft}
            state={state}
            currentSet={currentSet}
            totalSets={config.sets}
            intervalType={getIntervalTypeForDisplay(currentType)}
            currentIntervalName={getCurrentIntervalName()}
            progress={getTimerProgress()}
            overallProgress={overallProgress}
            totalTimeRemaining={totalTimeRemaining}
            showStepCounter={true}
            currentStep={currentItemIndex + 1}
            totalSteps={flattenedIntervals.length}
            isHolding={isHolding}
            holdProgress={holdProgress}
            onFastBackward={fastBackward}
            onFastForward={fastForward}
            onHoldStart={handleHoldStart}
            onHoldEnd={handleHoldEnd}
            onPlay={startTimer}
            onPause={pauseTimer}
          />
        </MinimalisticContainer>
      )}

      {!isMinimalisticView && (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-4">
                <StatCard
                  label="Total Session Time"
                  value={formatTime(totalSessionTime)}
                />
                <StatCard
                  label="Sets"
                  value={config.sets.toString()}
                  valueClassName="text-2xl font-bold"
                />
                <StatCard
                  label="Total Steps"
                  value={flattenedIntervals.length.toString()}
                  valueClassName="text-2xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Workout Sequence</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={addInterval}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Add Interval
                  </Button>
                  <Button
                    onClick={addLoop}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Repeat size={16} />
                    Add Loop
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Settings size={16} />
                    Settings
                  </Button>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={config.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {config.items.map((item) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        onToggleCollapse={toggleLoopCollapse}
                        onAddToLoop={addToLoop}
                        activeId={activeId}
                        colors={config.colors}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div className="rounded-lg border bg-white p-3 shadow-lg">
                      <div className="text-sm font-medium">
                        {findItemById(config.items, activeId)?.name || "Item"}
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              <div className="flex items-center gap-4">
                <Label htmlFor="advancedSets">Total Sets:</Label>
                <NumberInput
                  id="advancedSets"
                  value={config.sets}
                  onChange={(value) =>
                    setConfig((prev) => ({ ...prev, sets: value }))
                  }
                  min={1}
                  step={1}
                  className="w-32"
                />
              </div>
            </div>

            <TimerControls
              state={state}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              onStop={stopTimer}
              onFastBackward={fastBackward}
              onFastForward={fastForward}
              startLabel="Start Advanced Timer"
              resetLabel="Start New Advanced Workout"
              disabled={flattenedIntervals.length === 0}
            />
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent title="Color Settings" className="max-w-lg">
          <DialogClose onClose={() => setShowSettings(false)} />

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-medium">Interval Colors</h3>

              <ColorPicker
                label="Prepare Intervals"
                value={config.colors.prepare}
                onChange={(color) => updateColor("prepare", color)}
              />

              <ColorPicker
                label="Work Intervals"
                value={config.colors.work}
                onChange={(color) => updateColor("work", color)}
              />

              <ColorPicker
                label="Rest Intervals"
                value={config.colors.rest}
                onChange={(color) => updateColor("rest", color)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-medium">Loop Colors</h3>

              <ColorPicker
                label="Main Loops"
                value={config.colors.loop}
                onChange={(color) => updateColor("loop", color)}
              />

              <ColorPicker
                label="Nested Loops"
                value={config.colors.nestedLoop}
                onChange={(color) => updateColor("nestedLoop", color)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={resetColors}
                variant="outline"
                className="flex-1"
              >
                Reset to Defaults
              </Button>
              <Button onClick={() => setShowSettings(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
