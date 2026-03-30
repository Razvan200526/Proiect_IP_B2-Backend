import chalk from "chalk";
import figures from 'figures'
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import PrettyError from "pretty-error";
const pe = new PrettyError();

try {
    const db = drizzle(Bun.env.DATABASE_URL!);
    await migrate(db, { migrationsFolder: "drizzle" });
} catch (error) {
    if (error instanceof Error) {
        console.error(pe.render(error));
    } else {
        console.log(error);
    }
    process.exit(1);
}

console.log(chalk.magentaBright(`${figures.tick} Migrations applied successfully!`));
process.exit();