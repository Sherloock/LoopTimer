import { z } from "zod";

export const timerSchema = z.object({
	name: z.string().min(1).max(100),
	data: z.any(),
});

export type TimerInput = z.infer<typeof timerSchema>;
