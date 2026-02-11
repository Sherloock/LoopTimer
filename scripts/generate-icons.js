const fs = require("fs");
const path = require("path");

async function generateIcons() {
	const sharp = require("sharp");
	const publicDir = path.join(__dirname, "..", "public");
	const svgPath = path.join(publicDir, "icon.svg");

	if (!fs.existsSync(svgPath)) {
		console.error("icon.svg not found in public folder");
		process.exit(1);
	}

	const svgBuffer = fs.readFileSync(svgPath);

	// Generate different sized PNGs
	const sizes = [192, 512];

	for (const size of sizes) {
		const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
		await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
		console.log(`Generated icon-${size}x${size}.png`);
	}

	// Also generate apple-icon.png (180x180)
	const appleIconPath = path.join(publicDir, "apple-icon.png");
	await sharp(svgBuffer).resize(180, 180).png().toFile(appleIconPath);
	console.log("Generated apple-icon.png");

	console.log("All icons generated successfully!");
}

generateIcons().catch(console.error);
