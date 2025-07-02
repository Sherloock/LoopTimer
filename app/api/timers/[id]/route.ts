import { deleteTimer } from "@/actions/timers/deleteTimer";
import { getTimerById } from "@/actions/timers/getTimerById";
import { updateTimer } from "@/actions/timers/updateTimer";
import { NextResponse } from "next/server";

interface Params {
	params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
	try {
		const timer = await getTimerById(params.id);
		return NextResponse.json(timer);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 404 },
		);
	}
}

export async function PUT(req: Request, { params }: Params) {
	try {
		const body = await req.json();
		const timer = await updateTimer(params.id, body);
		return NextResponse.json(timer);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}

export async function DELETE(_: Request, { params }: Params) {
	try {
		await deleteTimer(params.id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}
