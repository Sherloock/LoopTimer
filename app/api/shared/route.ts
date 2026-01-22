import { NextRequest, NextResponse } from "next/server";
import { createSharedTimer } from "@/actions/shared/createSharedTimer";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const result = await createSharedTimer(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.error === "Access denied" ? 403 : 400 },
			);
		}

		return NextResponse.json(result.sharedTimer, { status: 201 });
	} catch (error) {
		console.error("POST /api/shared error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
