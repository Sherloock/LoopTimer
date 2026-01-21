import { z } from "zod";

import { TIMER_NAME_MAX_LENGTH } from "@/lib/constants/timers";

export const timerSchema = z.object({
	name: z.string().min(1).max(TIMER_NAME_MAX_LENGTH),
	data: z.any(),
});

export type TimerInput = z.infer<typeof timerSchema>;
