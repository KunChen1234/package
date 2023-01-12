import { PrismaClient } from "@prisma/client";

async function logout(prisma: PrismaClient, ID: string) {
    await prisma.loginInfo.delete(
        {
            where: {
                userID: ID
            }
        }
    );

}
export default logout;