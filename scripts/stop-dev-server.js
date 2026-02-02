#!/usr/bin/env node

/**
 * Stop dev server on port (Windows-compatible)
 * Kills any process listening on the configured port
 * Defaults to port 3000 to match dev server
 */

const { exec } = require("child_process");
const os = require("os");

const PORT = process.env.PORT;
const platform = os.platform();

function stopDevServer() {
	if (platform === "win32") {
		// Windows: Find PIDs on port, then kill them
		exec(`netstat -ano | findstr :${PORT}`, (error, stdout, stderr) => {
			if (error || !stdout) {
				console.log(`No process found on port ${PORT}`);
				process.exit(0);
				return;
			}

			// Extract PIDs from netstat output
			const lines = stdout.trim().split("\n");
			const pids = new Set();

			for (const line of lines) {
				const parts = line.trim().split(/\s+/);
				if (parts.length >= 5) {
					const pid = parts[parts.length - 1];
					if (pid && !isNaN(pid)) {
						pids.add(pid);
					}
				}
			}

			if (pids.size === 0) {
				console.log(`No process found on port ${PORT}`);
				process.exit(0);
				return;
			}

			// Kill each PID
			let completed = 0;
			const totalPids = pids.size;

			if (totalPids === 0) {
				console.log(`No process found on port ${PORT}`);
				process.exit(0);
				return;
			}

			for (const pid of pids) {
				exec(`taskkill /PID ${pid} /F`, (killError) => {
					completed++;
					if (!killError) {
						console.log(`Stopped process ${pid} on port ${PORT}`);
					}
					// Exit when all kill attempts complete (success or failure)
					if (completed === totalPids) {
						process.exit(0);
					}
				});
			}
		});
	} else {
		// Linux/macOS: Find and kill process on port
		exec(`lsof -ti :${PORT} | xargs kill -9`, (error, stdout, stderr) => {
			if (error) {
				if (
					error.message.includes("not found") ||
					stderr.includes("not found")
				) {
					console.log(`No process found on port ${PORT}`);
					process.exit(0);
				} else {
					console.error(`Error stopping dev server: ${error.message}`);
					process.exit(1);
				}
			} else {
				console.log(`Stopped dev server on port ${PORT}`);
				if (stdout) console.log(stdout);
			}
		});
	}
}

stopDevServer();
