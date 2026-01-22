import { getSharedTimer } from "@/actions/shared/getSharedTimer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const result = await getSharedTimer(id);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{
					status:
						result.error === "Shared timer not found"
							? 404
							: result.error === "Shared timer has expired"
								? 410
								: 500,
				},
			);
		}

		return NextResponse.json(result.sharedTimer);
	} catch (error) {
		console.error("GET /api/shared/[id] error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
