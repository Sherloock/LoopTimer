import { createTimer } from "@/actions/timers/createTimer";
import { getTimers } from "@/actions/timers/getTimers";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const timers = await getTimers();
		return NextResponse.json(timers);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const timer = await createTimer(body);
		return NextResponse.json(timer, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}
