import { PrismaClient } from "@prisma/client";
import setLogger from "./logger";

async function connectDb(prisma: PrismaClient): Promise<void> {
    const logger = setLogger("Connect Database");
    //Connect to the database
    await prisma.$connect().then(() => {
        logger.debug("Connected To the Database");
    }).catch((err: Error) => {
        logger.error(err.message);
        logger.info("Unable to connect to database. Disconnecting");
        process.exit(1);
    });
    return;
}
export default connectDb;