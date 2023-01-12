import { PrismaClient } from "@prisma/client";
import { TagBoardInfo } from "../../src/typeguards/TagBoardInfo";
import setLogger from "../logger";
import LoginInfoForSaving from "../typeguards/FormUsedForSaveLoginInfo";


/**
 * 
 * @param info personnel information and device information
 * @param prisma prisma client
 * Save information in Login Table in Database.
 */
async function Login(info: LoginInfoForSaving, prisma: PrismaClient) {
    const logger = setLogger("Save data in Login List");
    try {
        if (info.isDayShift != null) {
            await prisma.loginInfo.create(
                {
                    data: {
                        userID: info.userID,
                        LoginTime: info.LoginTime,
                        LampMAC: info.LampMAC,
                        LampSN: info.LampSN,
                        isDayShift: info.isDayShift
                    }
                }
            )
        }
    } catch (e) {
        logger.info(e);
    }

    const a = await prisma.loginInfo.findMany();
    logger.debug(a);
}
export default Login;