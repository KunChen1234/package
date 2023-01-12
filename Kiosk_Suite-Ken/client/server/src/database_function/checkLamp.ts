import { PrismaClient } from "@prisma/client";
import setLogger from "../logger";
/**
 * Used to when new people try to login, if this Lamp already scaned return false, elese return true.
 * 
 * */
async function checkLamp(prisma: PrismaClient, LampMAC: string, LampSN: string): Promise<boolean> {
    return new Promise(async (resolve) => {
        try {
            const data = await prisma.loginInfo.findMany({
                where: {
                    LampMAC: LampMAC,
                    LampSN: LampSN
                }
            });
            if (data.length > 0) {
                //already login
                resolve(false);
                // console.log(data);
            }
            else {
                resolve(true);
            }
        }
        catch (e) {
            const logger = setLogger("Login List Table From database");
            logger.info(e);
        }

    })
}
export default checkLamp;
