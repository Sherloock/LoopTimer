import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SignedIn>{children}</SignedIn>
			<SignedOut>
				<RedirectToSignIn />
			</SignedOut>
		</>
	);
}
