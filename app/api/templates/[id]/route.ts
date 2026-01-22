import { NextRequest, NextResponse } from "next/server";
import { getTemplateById } from "@/actions/templates/getTemplates";
import { updateTemplate } from "@/actions/templates/updateTemplate";
import { deleteTemplate } from "@/actions/templates/deleteTemplate";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const result = await getTemplateById(id);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.error === "Template not found" ? 404 : 403 },
			);
		}

		return NextResponse.json(result.template);
	} catch (error) {
		console.error("GET /api/templates/[id] error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const result = await updateTemplate({
			id,
			...body,
		});

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{
					status:
						result.error === "Template not found"
							? 404
							: result.error === "Access denied"
								? 403
								: 400,
				},
			);
		}

		return NextResponse.json(result.template);
	} catch (error) {
		console.error("PUT /api/templates/[id] error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const result = await deleteTemplate(id);

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

		return NextResponse.json({ success: true }, { status: 204 });
	} catch (error) {
		console.error("DELETE /api/templates/[id] error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
