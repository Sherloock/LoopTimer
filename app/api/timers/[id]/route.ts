import { getTimerById } from "@/actions/timers/getTimerById";
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
