import { Pool } from "pg";
import chalk from "chalk";
import figures from "figures";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import PrettyError from "pretty-error";

const pe = new PrettyError();

async function main() {
	try {
		const pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			max: 1,
		});
		const db = drizzle(pool);

		await migrate(db, { migrationsFolder: "drizzle" });
		await pool.end();
	} catch (error) {
		if (error instanceof Error) {
			console.error(pe.render(error));
		} else {
			console.log(error);
		}
		process.exit(1);
	}

	console.log(
		chalk.magentaBright(`${figures.tick} Migrations applied successfully!`),
	);
}

main().catch((error) => {
	if (error instanceof Error) {
		console.error(pe.render(error));
	} else {
		console.log(error);
	}
	process.exit(1);
});
