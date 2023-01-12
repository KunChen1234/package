import { Area, Department, Location, LoginInfo, PrismaClient, User } from "@prisma/client";
import resultFromLoginTable from "../../src/typeguards/FormOfDataFromLoginTable";

/**
 * 
 * @param prisma 
 * @returns Get personnel information by ID from login list table in database;
 */
async function getLoginInfoByID(prisma: PrismaClient, userID: string): Promise<resultFromLoginTable | null | undefined> {
    let data: (LoginInfo & {
        Location: Location | null;
        User: (User & {
            Area: Area | null;
            Department: Department | null;
        }) | null;
    }) | null
    data = await prisma.loginInfo.findUnique({
        where: {
            userID: userID,
        },
        include: {
            Location: true,
            User:
            {
                include: {
                    Area: true,
                    Department: true,
                }
            }
        }
    });
    if (data != null) {
        const result: resultFromLoginTable = data;
        return new Promise((resolve) => {
            if (result) {
                resolve(result)
            }
            else {
                resolve(null)
            }
        })
    }
    else {

    }


}
export default getLoginInfoByID;