import path from "node:path";
import { log } from "@clack/prompts";
import consola from "consola";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import type { ProjectConfig } from "../../types";
import { getPackageExecutionCommand } from "../../utils/package-runner";

export async function setupFumadocs(config: ProjectConfig) {
	const { packageManager, projectDir } = config;

	try {
		log.info("Setting up Fumadocs...");

		const commandWithArgs = `create-fumadocs-app@latest fumadocs --src --no-install --pm ${packageManager} --no-eslint --no-biome --no-git`;

		const fumadocsInitCommand = getPackageExecutionCommand(
			packageManager,
			commandWithArgs,
		);

		const appsDir = path.join(projectDir, "apps");
		await fs.ensureDir(appsDir);

		await execa(fumadocsInitCommand, {
			cwd: appsDir,
			env: { CI: "true" },
			shell: true,
			stdio: "inherit",
		});

		const fumadocsDir = path.join(projectDir, "apps", "fumadocs");
		const packageJsonPath = path.join(fumadocsDir, "package.json");

		if (await fs.pathExists(packageJsonPath)) {
			const packageJson = await fs.readJson(packageJsonPath);
			packageJson.name = "fumadocs";

			if (packageJson.scripts?.dev) {
				packageJson.scripts.dev = `${packageJson.scripts.dev} --port=4000`;
			}

			await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
		}

		log.success("Fumadocs setup successfully!");
	} catch (error) {
		log.error(pc.red("Failed to set up Fumadocs"));
		if (error instanceof Error) {
			consola.error(pc.red(error.message));
		}
	}
}
