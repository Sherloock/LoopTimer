import {
	ADVANCED_TIMER_DEFAULT_COLORS,
	SYSTEM_USER_ID,
	TEMPLATE_CATEGORIES,
} from "@/lib/constants/timers";
import { db } from "@/prisma";
import type { AdvancedConfig } from "@/types/advanced-timer";

const DEFAULT_CONFIG_BASE = {
	colors: ADVANCED_TIMER_DEFAULT_COLORS,
	defaultAlarm: "beep",
	speakNames: true,
};

async function main() {
	console.log("🌱 Seeding database...");

	// Tabata Classic: 8 rounds, 20s work / 10s rest
	const tabataConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 8,
				items: [
					{
						id: "work-1",
						name: "Work",
						duration: 20,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 10,
						type: "rest",
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-tabata" },
		update: {},
		create: {
			id: "template-tabata",
			userId: SYSTEM_USER_ID,
			name: "Tabata Classic",
			description:
				"The original Tabata protocol: 8 rounds of 20 seconds all-out effort followed by 10 seconds rest. Total time: 4 minutes of intense training.",
			category: TEMPLATE_CATEGORIES.TABATA,
			data: tabataConfig as any,
			isPublic: true,
		},
	});

	// HIIT Beginner: 30s work / 30s rest, 10 rounds
	const hiitBeginnerConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Get Ready",
				duration: 10,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 10,
				items: [
					{
						id: "work-1",
						name: "Work",
						duration: 30,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 30,
						type: "rest",
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-hiit-beginner" },
		update: {},
		create: {
			id: "template-hiit-beginner",
			userId: SYSTEM_USER_ID,
			name: "HIIT Beginner",
			description:
				"Perfect for beginners: 10 rounds of 30 seconds work with 30 seconds rest. Total time: 10 minutes with warm-up.",
			category: TEMPLATE_CATEGORIES.HIIT,
			data: hiitBeginnerConfig as any,
			isPublic: true,
		},
	});

	// Boxing Rounds: 3min work / 1min rest, 12 rounds
	const boxingConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 180,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 12,
				items: [
					{
						id: "work-1",
						name: "Round",
						duration: 180,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 60,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-boxing" },
		update: {},
		create: {
			id: "template-boxing",
			userId: SYSTEM_USER_ID,
			name: "Boxing Rounds",
			description:
				"Professional boxing training: 12 rounds of 3 minutes with 1 minute rest between rounds. Total time: 48 minutes.",
			category: TEMPLATE_CATEGORIES.BOXING,
			data: boxingConfig as any,
			isPublic: true,
		},
	});

	// 7-Minute Workout: 12 exercises × 30s, 10s rest
	const sevenMinuteConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 12,
				items: [
					{
						id: "work-1",
						name: "Exercise",
						duration: 30,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Transition",
						duration: 10,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-seven-minute" },
		update: {},
		create: {
			id: "template-seven-minute",
			userId: SYSTEM_USER_ID,
			name: "7-Minute Workout",
			description:
				"The famous scientific 7-minute workout: 12 exercises, 30 seconds each with 10-second transitions. Full body in minimal time.",
			category: TEMPLATE_CATEGORIES.STRENGTH,
			data: sevenMinuteConfig as any,
			isPublic: true,
		},
	});

	// Yoga Flow: 5 poses × 1min, 30s transitions
	const yogaConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 5,
				items: [
					{
						id: "work-1",
						name: "Hold Pose",
						duration: 60,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Transition",
						duration: 30,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-yoga" },
		update: {},
		create: {
			id: "template-yoga",
			userId: SYSTEM_USER_ID,
			name: "Yoga Flow",
			description:
				"Gentle yoga sequence: 5 poses held for 1 minute each with 30-second transitions. Total time: 7.5 minutes.",
			category: TEMPLATE_CATEGORIES.YOGA,
			data: yogaConfig as any,
			isPublic: true,
		},
	});

	// Pomodoro: 25min work / 5min rest, 4 rounds + long break
	const pomodoroConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 4,
				items: [
					{
						id: "work-1",
						name: "Focus",
						duration: 1500,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Break",
						duration: 300,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
			{
				id: "rest-2",
				name: "Long Break",
				duration: 900,
				type: "rest",
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-pomodoro" },
		update: {},
		create: {
			id: "template-pomodoro",
			userId: SYSTEM_USER_ID,
			name: "Pomodoro Classic",
			description:
				"Productivity technique: 4 rounds of 25-minute focus sessions with 5-minute breaks, followed by a 15-minute long break. Total time: 2 hours.",
			category: TEMPLATE_CATEGORIES.POMODORO,
			data: pomodoroConfig as any,
			isPublic: true,
		},
	});

	console.log("✅ Seeded 6 system templates");
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
