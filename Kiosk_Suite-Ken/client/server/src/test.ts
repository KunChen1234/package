import getLoginInfoByID from "./database_function/checkUser";

var loginInfo = await getLoginInfoByID(prisma, result.ID);
if (loginInfo) {
    wsServer.emit("userManagement", loginInfo);
}
else {
    var dataFromdatabase = await SelectPersonInfoByID(prisma, result.ID);
    //  && CheckID
    if (dataFromdatabase) {
        // var date = new Date()
        var newpeople: PeopleInfoTag = {
            ID: dataFromdatabase.userID,
            section: dataFromdatabase.areaName,
            lastName: dataFromdatabase.lastName,
            firstName: dataFromdatabase.firstName,
            departmentName: dataFromdatabase.departmentName,
            photo: dataFromdatabase.photo,
            job: dataFromdatabase.job
        }
        // console.log(newpeople)
        wsServer.emit("PersonnelInfo", newpeople);
    }
    else {
        logger.debug("Get people information from database failed!");
    }
}
