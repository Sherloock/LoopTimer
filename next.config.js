/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"date-fns",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-select",
			"@radix-ui/react-checkbox",
			"@radix-ui/react-tabs",
			"@radix-ui/react-progress",
			"@radix-ui/react-label",
		],
	},
	turbopack: {
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},
	// Improve hydration handling
	reactStrictMode: true,
	// Add headers to prevent caching issues that could cause hydration mismatches
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
				],
			},
		];
	},
};

module.exports = nextConfig;
