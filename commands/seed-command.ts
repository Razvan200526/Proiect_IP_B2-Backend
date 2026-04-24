import { Pool } from "pg";
import chalk from "chalk";
import figures from "figures";
import { is } from "drizzle-orm";
import { type PgTable, PgTable as PgTableEntity } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import PrettyError from "pretty-error";
import { reset } from "drizzle-seed";
import { createSeedContext, entitySeeds } from "../seeds";
const pe = new PrettyError();
import * as schema from "../src/db/schema";
import { mainSymbols } from "figures";

const seedSchema = Object.fromEntries(
	Object.entries(schema).filter(([, value]) => is(value, PgTableEntity)),
) as Record<string, PgTable>;

async function main() {
	try {
		const pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			max: 1,
		});
		const db = drizzle(pool);
		const context = createSeedContext();

		await reset(db, seedSchema);
		for (const entitySeed of entitySeeds) {
			await entitySeed.run(db, context);
			console.log(
				chalk.greenBright(
					`${mainSymbols.tick} ${entitySeed.name.at(0)?.toUpperCase() + entitySeed.name.slice(1)}Seed applied succesfully`,
				),
			);
		}
		await pool.end();
	} catch (error) {
		if (error instanceof Error) {
			console.error(pe.render(error));

			const cause = error.cause;
			if (cause instanceof Error) {
				console.error(chalk.redBright("Caused by:"));
				console.error(cause);
			}
		} else {
			console.log(error);
		}
		process.exit(1);
	}

	console.log(chalk.green(`${figures.tick} All seeds applied successfully!`));
}

main().catch((error) => {
	if (error instanceof Error) {
		console.error(pe.render(error));
	} else {
		console.log(error);
	}
	process.exit(1);
});
