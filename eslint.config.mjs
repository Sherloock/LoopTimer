import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "eslint-config-next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default [
	...nextPlugin.flatConfigs.coreWebVitals,
	...compat.extends("plugin:prettier/recommended"),
	{
		rules: {
			indent: "off",
			"no-tabs": "off",
		},
	},
];
