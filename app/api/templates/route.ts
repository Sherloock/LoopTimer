import { NextRequest, NextResponse } from "next/server";
import {
	getTemplates,
	type GetTemplatesParams,
} from "@/actions/templates/getTemplates";
import { createTemplate } from "@/actions/templates/createTemplate";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const category = searchParams.get("category") || undefined;
		const search = searchParams.get("search") || undefined;
		const includePrivate =
			searchParams.get("includePrivate") === "true" || undefined;

		const params: GetTemplatesParams = {
			category,
			search,
			includePrivate,
		};

		const result = await getTemplates(params);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.error === "Access denied" ? 403 : 500 },
			);
		}

		return NextResponse.json(result.templates);
	} catch (error) {
		console.error("GET /api/templates error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const result = await createTemplate(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.error === "Access denied" ? 403 : 400 },
			);
		}

		return NextResponse.json(result.template, { status: 201 });
	} catch (error) {
		console.error("POST /api/templates error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
