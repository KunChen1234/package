"use strict";
import { DeviceInfo } from "./typeguards/DeviceInfo";
import LoginInfoForSelect from "./typeguards/FormOfDataFromLoginTable";
import { resultOfUser } from "./typeguards/FormOfDataFromUserDatabase";
import { PeopleInfoTag } from "./typeguards/PeopleInfoTag";
import { TagBoardInfo } from "./typeguards/TagBoardInfo";

interface ServerToClientEvents {
    noArg: () => void;

    tagID: (tagID: string) => void;
    // PeopleID: (ID: string) => void;
    PersonnelInfo: (Info: PeopleInfoTag) => void;
    LampInfo: (Info: DeviceInfo) => void;
    LampAlreadyLogin: (isScanned: boolean) => void;// If true, already login, if false, did not login
    userManagement: (Login: TagBoardInfo) => void;
}
interface ClientToServerEvents {
    hello: () => void;
    connection_error: (err: unknown) => void;
    shutdown: (callback: (arg0: boolean) => void) => void;

    //get new sign in information
    getNewSignInInfo: (userInfo: PeopleInfoTag, deviceInfo: DeviceInfo) => void;
    //update devices
    updateSignInInfo: (userInfo: PeopleInfoTag, deviceInfo: DeviceInfo) => void;
    //Logout
    Logout: (ID: string) => void;
}
interface InterServerEvents {
    ping: () => void;
}
interface SocketData {
    id: string;
    timeOfConnection: Date;
}

export { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData }