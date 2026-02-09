/**
 * Syncs shared AI rules from .ai-rules/*.md into .cursor/rules/ as shared-*.mdc
 * so Cursor picks them up. Run after clone or when .ai-rules content changes.
 * OpenCode uses .ai-rules via opencode.json instructions; this script is for Cursor only.
 *
 * Usage: node scripts/sync-ai-rules.js
 * (Optional: run from post-checkout or post-merge hook if .ai-rules is a submodule.)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AI_RULES_DIR = path.join(ROOT, ".ai-rules");
const CURSOR_RULES_DIR = path.join(ROOT, ".cursor", "rules");
const SHARED_PREFIX = "shared-";

function toDescription(basename) {
	const label = basename.replace(/-/g, " ");
	return `Shared rule: ${label}.`;
}

function sync() {
	if (!fs.existsSync(AI_RULES_DIR)) {
		console.warn(
			".ai-rules not found; skipping sync. Add submodule or create .ai-rules with shared rule .md files.",
		);
		return;
	}

	if (!fs.existsSync(CURSOR_RULES_DIR)) {
		fs.mkdirSync(CURSOR_RULES_DIR, { recursive: true });
	}

	const entries = fs.readdirSync(AI_RULES_DIR, { withFileTypes: true });
	const syncedNames = new Set();

	for (const ent of entries) {
		if (!ent.isFile() || !ent.name.endsWith(".md")) continue;
		const base = ent.name.slice(0, -3);
		const srcPath = path.join(AI_RULES_DIR, ent.name);
		const body = fs.readFileSync(srcPath, "utf8");
		const mdcName = `${SHARED_PREFIX}${base}.mdc`;
		const mdcPath = path.join(CURSOR_RULES_DIR, mdcName);
		const frontmatter = `---
description: ${toDescription(base)}
alwaysApply: false
---

`;
		fs.writeFileSync(mdcPath, frontmatter + body, "utf8");
		syncedNames.add(mdcName);
	}

	// Remove shared-*.mdc that no longer have a source in .ai-rules
	const cursorRules = fs.readdirSync(CURSOR_RULES_DIR, { withFileTypes: true });
	for (const ent of cursorRules) {
		if (
			!ent.isFile() ||
			!ent.name.startsWith(SHARED_PREFIX) ||
			!ent.name.endsWith(".mdc")
		)
			continue;
		if (!syncedNames.has(ent.name)) {
			fs.unlinkSync(path.join(CURSOR_RULES_DIR, ent.name));
		}
	}
}

sync();
