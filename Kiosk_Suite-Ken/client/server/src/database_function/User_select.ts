import { Area, Department, PrismaClient, User } from '@prisma/client';
import { resolve } from 'path';
import { resultOfUser } from '../../src/typeguards/FormOfDataFromUserDatabase';
import setLogger from '../logger';

/**
 * 
 * @param prisma prisma client.
 * @param number userID
 * @returns result of search by ID in user table from database and return the user's information
 */

async function SelectPersonInfoByID(prisma: PrismaClient, number: string): Promise<resultOfUser | null> {
    let user: (User & { Area: Area | null; Department: Department | null; }) | null;
    const logger = setLogger("user_table_in_database");
    try {
        user = await prisma.user.findUnique({
            where: {
                userID: number,
            },
            include: {
                Area: true,
                Department: true
            }
        })
        return new Promise((resolve) => {
            if (user) {
                const data: resultOfUser = user;
                // console.log(data);
                resolve(data);
            }
            else {
                resolve(null);
            }
        })
    }
    catch (e) {
        logger.error(e);
    }
    return null;
}
export default SelectPersonInfoByID;
