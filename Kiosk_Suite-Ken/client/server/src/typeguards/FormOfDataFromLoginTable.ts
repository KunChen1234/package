import { resultOfUser } from "./FormOfDataFromUserDatabase";
import LocationInfo from "./LocationInfo";


/**
 * This interface is form of result which get from Login table in database;
 * User: The information of people who login;
 * userID: People's ID;
 * LoginTime: The time of when the people login;
 * LampMAC: The MAC of lamp;
 * LampSN: The serial number of lamp;
 * Location: The location of people and location is connectd to bssid;
 * LampBssid: The Bssid of lamp get from MQTT;
 * LastUpdateTime: The time when client information updated;
 * isDayShift: If this is TRUE, the person is Dayshift, if it is FALSE, the person is Nightshfit, if it is null, no information of person's shift;
 */
interface LoginInfoForSelect {
    User: resultOfUser | null;
    userID: String;
    LoginTime: String;
    LampMAC: String;
    LampSN: String;
    Location: LocationInfo | null;
    LampBssid: String | undefined | null;
    LastUpdateTime: String | undefined | null;
    isDayShift: boolean;
}
export default LoginInfoForSelect;