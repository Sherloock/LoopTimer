import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleSearchParam(
	searchParams: SearchParams | undefined,
	key: string,
): string | undefined {
	const value = searchParams?.[key];
	return typeof value === "string" ? value : undefined;
}

export default async function SignUpPage({
	searchParams,
}: {
	searchParams?: SearchParams;
}) {
	const { userId } = await auth();
	if (!!userId) {
		redirect(ROUTES.HOME);
	}

	const redirectUrl =
		getSingleSearchParam(searchParams, "redirect_url") ??
		getSingleSearchParam(searchParams, "redirectUrl");
	const hasInvalidRedirectUrl =
		redirectUrl === "undefined" || redirectUrl === "null" || redirectUrl === "";

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<SignUp
				fallbackRedirectUrl={ROUTES.HOME}
				forceRedirectUrl={hasInvalidRedirectUrl ? ROUTES.HOME : undefined}
			/>
		</div>
	);
}
