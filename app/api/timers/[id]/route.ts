import { deleteTimer } from "@/actions/timers/deleteTimer";
import { getTimerById } from "@/actions/timers/getTimerById";
import { updateTimer } from "@/actions/timers/updateTimer";
import { NextResponse } from "next/server";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const timer = await getTimerById(id);
		return NextResponse.json(timer);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 404 },
		);
	}
}

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await req.json();
		const timer = await updateTimer(id, body);
		return NextResponse.json(timer);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}

export async function DELETE(
	_: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		await deleteTimer(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}
