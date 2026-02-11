import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
	width: 180,
	height: 180,
};
export const contentType = "image/png";

// Image generation
export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#050510",
				borderRadius: "36px",
			}}
		>
			<svg
				width="140"
				height="140"
				viewBox="0 0 32 32"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					cx="16"
					cy="16"
					r="13"
					fill="none"
					stroke="#00e5ff"
					strokeWidth="2"
				/>
				<line
					x1="16"
					y1="4.5"
					x2="16"
					y2="7"
					stroke="#00e5ff"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="27.5"
					y1="16"
					x2="25"
					y2="16"
					stroke="#00e5ff"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="16"
					y1="27.5"
					x2="16"
					y2="25"
					stroke="#00e5ff"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="4.5"
					y1="16"
					x2="7"
					y2="16"
					stroke="#00e5ff"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="16"
					y1="16"
					x2="11"
					y2="10"
					stroke="#00e5ff"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
				<line
					x1="16"
					y1="16"
					x2="22.5"
					y2="8"
					stroke="#00e5ff"
					strokeWidth="1.6"
					strokeLinecap="round"
				/>
				<circle cx="16" cy="16" r="2" fill="#00e5ff" />
				<circle cx="16" cy="16" r="1" fill="#fff" />
			</svg>
		</div>,
		{ ...size },
	);
}
