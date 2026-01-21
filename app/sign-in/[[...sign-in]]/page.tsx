import { ROUTES } from "@/lib/constants/routes";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleSearchParam(
	searchParams: SearchParams | undefined,
	key: string,
): string | undefined {
	const value = searchParams?.[key];
	return typeof value === "string" ? value : undefined;
}

export default async function SignInPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const { userId } = await auth();
	if (!!userId) {
		redirect(ROUTES.HOME);
	}

	const resolvedSearchParams = await searchParams;

	const redirectUrl =
		getSingleSearchParam(resolvedSearchParams, "redirect_url") ??
		getSingleSearchParam(resolvedSearchParams, "redirectUrl");
	const hasInvalidRedirectUrl =
		redirectUrl === "undefined" || redirectUrl === "null" || redirectUrl === "";

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<SignIn
				fallbackRedirectUrl={ROUTES.HOME}
				forceRedirectUrl={hasInvalidRedirectUrl ? ROUTES.HOME : undefined}
			/>
		</div>
	);
}
