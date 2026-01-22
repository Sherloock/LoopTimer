import {
	getUserPreferences,
	updateUserPreferences,
} from "@/actions/user/preferences";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const preferences = await getUserPreferences();
		return NextResponse.json(preferences);
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
		const preferences = await updateUserPreferences(body);
		return NextResponse.json(preferences);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}

export async function PUT(req: Request) {
	try {
		const body = await req.json();
		const preferences = await updateUserPreferences(body);
		return NextResponse.json(preferences);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 },
		);
	}
}
