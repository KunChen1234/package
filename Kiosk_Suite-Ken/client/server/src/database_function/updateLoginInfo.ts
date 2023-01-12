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
async function updateSignInInfo(info: LoginInfoForSaving, prisma: PrismaClient) {
    const logger = setLogger("Save data in Login List");
    try {
        if (info.isDayShift != null) {
            await prisma.loginInfo.updateMany(
                {
                    where: {
                        userID: info.userID,
                    },
                    data: { LampMAC: info.LampMAC, LampSN: info.LampSN }
                }
            )
        }
    } catch (e) {
        logger.info(e);
    }

    const a = await prisma.loginInfo.findMany();
    console.log(a)
}
export default updateSignInInfo;