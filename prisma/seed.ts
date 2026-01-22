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
		update: {
			description:
				"The original Tabata protocol: 8 rounds of 20 seconds all-out effort followed by 10 seconds rest. Intense training for maximum results.",
		},
		create: {
			id: "template-tabata",
			userId: SYSTEM_USER_ID,
			name: "Tabata Classic",
			description:
				"The original Tabata protocol: 8 rounds of 20 seconds all-out effort followed by 10 seconds rest. Intense training for maximum results.",
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
		update: {
			description:
				"Perfect for beginners: 10 rounds of 30 seconds work with 30 seconds rest. Includes warm-up preparation.",
		},
		create: {
			id: "template-hiit-beginner",
			userId: SYSTEM_USER_ID,
			name: "HIIT Beginner",
			description:
				"Perfect for beginners: 10 rounds of 30 seconds work with 30 seconds rest. Includes warm-up preparation.",
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
		update: {
			description:
				"Professional boxing training: 12 rounds of 3 minutes with 1 minute rest between rounds. Includes warm-up.",
		},
		create: {
			id: "template-boxing",
			userId: SYSTEM_USER_ID,
			name: "Boxing Rounds",
			description:
				"Professional boxing training: 12 rounds of 3 minutes with 1 minute rest between rounds. Includes warm-up.",
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
		update: {
			description:
				"Gentle yoga sequence: 5 poses held for 1 minute each with 30-second transitions between poses.",
		},
		create: {
			id: "template-yoga",
			userId: SYSTEM_USER_ID,
			name: "Yoga Flow",
			description:
				"Gentle yoga sequence: 5 poses held for 1 minute each with 30-second transitions between poses.",
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
		update: {
			description:
				"Productivity technique: 4 rounds of 25-minute focus sessions with 5-minute breaks, followed by a 15-minute long break.",
		},
		create: {
			id: "template-pomodoro",
			userId: SYSTEM_USER_ID,
			name: "Pomodoro Classic",
			description:
				"Productivity technique: 4 rounds of 25-minute focus sessions with 5-minute breaks, followed by a 15-minute long break.",
			category: TEMPLATE_CATEGORIES.POMODORO,
			data: pomodoroConfig as any,
			isPublic: true,
		},
	});

	// Tabata Extended: 10 rounds, 20s work / 10s rest
	const tabataExtendedConfig: AdvancedConfig = {
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
		where: { id: "template-tabata-extended" },
		update: {},
		create: {
			id: "template-tabata-extended",
			userId: SYSTEM_USER_ID,
			name: "Tabata Extended",
			description:
				"Extended Tabata session: 10 rounds of 20 seconds work with 10 seconds rest. More rounds for increased endurance.",
			category: TEMPLATE_CATEGORIES.TABATA,
			data: tabataExtendedConfig as any,
			isPublic: true,
		},
	});

	// Tabata Power: 6 rounds, 30s work / 15s rest
	const tabataPowerConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 6,
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
						duration: 15,
						type: "rest",
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-tabata-power" },
		update: {},
		create: {
			id: "template-tabata-power",
			userId: SYSTEM_USER_ID,
			name: "Tabata Power",
			description:
				"High-intensity Tabata variation: 6 rounds of 30 seconds work with 15 seconds rest. Longer work intervals for power development.",
			category: TEMPLATE_CATEGORIES.TABATA,
			data: tabataPowerConfig as any,
			isPublic: true,
		},
	});

	// HIIT Intermediate: 45s work / 15s rest, 8 rounds
	const hiitIntermediateConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 60,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 8,
				items: [
					{
						id: "work-1",
						name: "Work",
						duration: 45,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 15,
						type: "rest",
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-hiit-intermediate" },
		update: {},
		create: {
			id: "template-hiit-intermediate",
			userId: SYSTEM_USER_ID,
			name: "HIIT Intermediate",
			description:
				"Intermediate HIIT workout: 8 rounds of 45 seconds work with 15 seconds rest. Includes 1-minute warm-up.",
			category: TEMPLATE_CATEGORIES.HIIT,
			data: hiitIntermediateConfig as any,
			isPublic: true,
		},
	});

	// HIIT Advanced: 60s work / 20s rest, 12 rounds
	const hiitAdvancedConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 120,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 12,
				items: [
					{
						id: "work-1",
						name: "Work",
						duration: 60,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 20,
						type: "rest",
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-hiit-advanced" },
		update: {},
		create: {
			id: "template-hiit-advanced",
			userId: SYSTEM_USER_ID,
			name: "HIIT Advanced",
			description:
				"Advanced HIIT challenge: 12 rounds of 60 seconds work with 20 seconds rest. Includes 2-minute warm-up for serious athletes.",
			category: TEMPLATE_CATEGORIES.HIIT,
			data: hiitAdvancedConfig as any,
			isPublic: true,
		},
	});

	// HIIT Quick: 20s work / 10s rest, 15 rounds
	const hiitQuickConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 15,
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
		where: { id: "template-hiit-quick" },
		update: {},
		create: {
			id: "template-hiit-quick",
			userId: SYSTEM_USER_ID,
			name: "HIIT Quick",
			description:
				"Quick HIIT blast: 15 rounds of 20 seconds work with 10 seconds rest. Perfect for a fast-paced workout when time is limited.",
			category: TEMPLATE_CATEGORIES.HIIT,
			data: hiitQuickConfig as any,
			isPublic: true,
		},
	});

	// Boxing Light: 2min work / 1min rest, 6 rounds
	const boxingLightConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 120,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 6,
				items: [
					{
						id: "work-1",
						name: "Round",
						duration: 120,
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
		where: { id: "template-boxing-light" },
		update: {},
		create: {
			id: "template-boxing-light",
			userId: SYSTEM_USER_ID,
			name: "Boxing Light",
			description:
				"Light boxing session: 6 rounds of 2 minutes with 1 minute rest. Perfect for beginners or recovery days. Includes warm-up.",
			category: TEMPLATE_CATEGORIES.BOXING,
			data: boxingLightConfig as any,
			isPublic: true,
		},
	});

	// Boxing Heavy: 3min work / 1min rest, 15 rounds
	const boxingHeavyConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 300,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 15,
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
		where: { id: "template-boxing-heavy" },
		update: {},
		create: {
			id: "template-boxing-heavy",
			userId: SYSTEM_USER_ID,
			name: "Boxing Heavy",
			description:
				"Intense boxing training: 15 rounds of 3 minutes with 1 minute rest. Championship-level endurance workout with extended warm-up.",
			category: TEMPLATE_CATEGORIES.BOXING,
			data: boxingHeavyConfig as any,
			isPublic: true,
		},
	});

	// Boxing Speed: 1min work / 30s rest, 10 rounds
	const boxingSpeedConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 60,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 10,
				items: [
					{
						id: "work-1",
						name: "Round",
						duration: 60,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 30,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-boxing-speed" },
		update: {},
		create: {
			id: "template-boxing-speed",
			userId: SYSTEM_USER_ID,
			name: "Boxing Speed",
			description:
				"Speed-focused boxing: 10 rounds of 1 minute with 30 seconds rest. Fast-paced rounds for agility and quickness training.",
			category: TEMPLATE_CATEGORIES.BOXING,
			data: boxingSpeedConfig as any,
			isPublic: true,
		},
	});

	// Strength Circuit: 45s work / 15s rest, 8 exercises
	const strengthCircuitConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 90,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 8,
				items: [
					{
						id: "work-1",
						name: "Exercise",
						duration: 45,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 15,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-strength-circuit" },
		update: {},
		create: {
			id: "template-strength-circuit",
			userId: SYSTEM_USER_ID,
			name: "Strength Circuit",
			description:
				"Full-body strength circuit: 8 exercises, 45 seconds each with 15 seconds rest. Includes warm-up for safe training.",
			category: TEMPLATE_CATEGORIES.STRENGTH,
			data: strengthCircuitConfig as any,
			isPublic: true,
		},
	});

	// Strength Power: 20s work / 40s rest, 10 rounds
	const strengthPowerConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 120,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 10,
				items: [
					{
						id: "work-1",
						name: "Exercise",
						duration: 20,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 40,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-strength-power" },
		update: {},
		create: {
			id: "template-strength-power",
			userId: SYSTEM_USER_ID,
			name: "Strength Power",
			description:
				"Power-focused strength training: 10 rounds of 20 seconds work with 40 seconds rest. Longer rest for maximum effort output.",
			category: TEMPLATE_CATEGORIES.STRENGTH,
			data: strengthPowerConfig as any,
			isPublic: true,
		},
	});

	// Strength Endurance: 60s work / 20s rest, 6 rounds
	const strengthEnduranceConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Warm Up",
				duration: 60,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 6,
				items: [
					{
						id: "work-1",
						name: "Exercise",
						duration: 60,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Rest",
						duration: 20,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-strength-endurance" },
		update: {},
		create: {
			id: "template-strength-endurance",
			userId: SYSTEM_USER_ID,
			name: "Strength Endurance",
			description:
				"Endurance strength training: 6 rounds of 60 seconds work with 20 seconds rest. Builds muscular endurance and stamina.",
			category: TEMPLATE_CATEGORIES.STRENGTH,
			data: strengthEnduranceConfig as any,
			isPublic: true,
		},
	});

	// Yoga Morning: 3 poses × 2min, 45s transitions
	const yogaMorningConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Centering",
				duration: 60,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 3,
				items: [
					{
						id: "work-1",
						name: "Hold Pose",
						duration: 120,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Transition",
						duration: 45,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-yoga-morning" },
		update: {},
		create: {
			id: "template-yoga-morning",
			userId: SYSTEM_USER_ID,
			name: "Yoga Morning",
			description:
				"Gentle morning yoga: 3 poses held for 2 minutes each with 45-second transitions. Includes centering time to start your day mindfully.",
			category: TEMPLATE_CATEGORIES.YOGA,
			data: yogaMorningConfig as any,
			isPublic: true,
		},
	});

	// Yoga Deep: 4 poses × 3min, 1min transitions
	const yogaDeepConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "prepare-1",
				name: "Breathing",
				duration: 120,
				type: "prepare",
			},
			{
				id: "loop-1",
				loops: 4,
				items: [
					{
						id: "work-1",
						name: "Hold Pose",
						duration: 180,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Transition",
						duration: 60,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-yoga-deep" },
		update: {},
		create: {
			id: "template-yoga-deep",
			userId: SYSTEM_USER_ID,
			name: "Yoga Deep",
			description:
				"Deep stretch yoga: 4 poses held for 3 minutes each with 1-minute transitions. Includes breathing preparation for deep relaxation.",
			category: TEMPLATE_CATEGORIES.YOGA,
			data: yogaDeepConfig as any,
			isPublic: true,
		},
	});

	// Yoga Quick: 6 poses × 30s, 15s transitions
	const yogaQuickConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 6,
				items: [
					{
						id: "work-1",
						name: "Hold Pose",
						duration: 30,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Transition",
						duration: 15,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-yoga-quick" },
		update: {},
		create: {
			id: "template-yoga-quick",
			userId: SYSTEM_USER_ID,
			name: "Yoga Quick",
			description:
				"Quick yoga flow: 6 poses held for 30 seconds each with 15-second transitions. Perfect for a fast stretch break.",
			category: TEMPLATE_CATEGORIES.YOGA,
			data: yogaQuickConfig as any,
			isPublic: true,
		},
	});

	// Pomodoro Short: 15min work / 3min rest, 4 rounds + 10min break
	const pomodoroShortConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 4,
				items: [
					{
						id: "work-1",
						name: "Focus",
						duration: 900,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Break",
						duration: 180,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
			{
				id: "rest-2",
				name: "Long Break",
				duration: 600,
				type: "rest",
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-pomodoro-short" },
		update: {},
		create: {
			id: "template-pomodoro-short",
			userId: SYSTEM_USER_ID,
			name: "Pomodoro Short",
			description:
				"Shorter focus sessions: 4 rounds of 15-minute focus with 3-minute breaks, followed by a 10-minute long break. Great for quick tasks.",
			category: TEMPLATE_CATEGORIES.POMODORO,
			data: pomodoroShortConfig as any,
			isPublic: true,
		},
	});

	// Pomodoro Extended: 45min work / 10min rest, 3 rounds + 20min break
	const pomodoroExtendedConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 3,
				items: [
					{
						id: "work-1",
						name: "Focus",
						duration: 2700,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Break",
						duration: 600,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
			{
				id: "rest-2",
				name: "Long Break",
				duration: 1200,
				type: "rest",
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-pomodoro-extended" },
		update: {},
		create: {
			id: "template-pomodoro-extended",
			userId: SYSTEM_USER_ID,
			name: "Pomodoro Extended",
			description:
				"Extended focus sessions: 3 rounds of 45-minute deep work with 10-minute breaks, followed by a 20-minute long break. For complex projects.",
			category: TEMPLATE_CATEGORIES.POMODORO,
			data: pomodoroExtendedConfig as any,
			isPublic: true,
		},
	});

	// Pomodoro Micro: 10min work / 2min rest, 5 rounds + 5min break
	const pomodoroMicroConfig: AdvancedConfig = {
		...DEFAULT_CONFIG_BASE,
		items: [
			{
				id: "loop-1",
				loops: 5,
				items: [
					{
						id: "work-1",
						name: "Focus",
						duration: 600,
						type: "work",
					},
					{
						id: "rest-1",
						name: "Break",
						duration: 120,
						type: "rest",
						skipOnLastLoop: true,
					},
				],
			},
			{
				id: "rest-2",
				name: "Long Break",
				duration: 300,
				type: "rest",
			},
		],
	};

	await db.timerTemplate.upsert({
		where: { id: "template-pomodoro-micro" },
		update: {},
		create: {
			id: "template-pomodoro-micro",
			userId: SYSTEM_USER_ID,
			name: "Pomodoro Micro",
			description:
				"Micro focus sessions: 5 rounds of 10-minute focus with 2-minute breaks, followed by a 5-minute long break. Ideal for quick sprints.",
			category: TEMPLATE_CATEGORIES.POMODORO,
			data: pomodoroMicroConfig as any,
			isPublic: true,
		},
	});

	console.log("✅ Seeded 24 system templates");
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
