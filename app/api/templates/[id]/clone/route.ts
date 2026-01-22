import { NextRequest, NextResponse } from "next/server";
import { cloneTemplate } from "@/actions/templates/cloneTemplate";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const result = await cloneTemplate(id);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{
					status:
						result.error === "Template not found"
							? 404
							: result.error === "Access denied"
								? 403
								: 500,
				},
			);
		}

		return NextResponse.json(result.timer, { status: 201 });
	} catch (error) {
		console.error("POST /api/templates/[id]/clone error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
