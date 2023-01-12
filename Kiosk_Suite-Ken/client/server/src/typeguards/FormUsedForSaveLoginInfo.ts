/**
 * userID: Personnel ID;
 * LoginTime: The time of user Login;
 * LampMAC: MAC of device;
 * LampSN: Serial Number of device;
 * isDayShift: If isDayShift is true, people is day shift,
 *             if isDayShift is false, people is night shift,
 *             if isDayShift is null, no information of this user in Shfit.
 * 
 * This form is used for save Login information in LoginInfo table in database.
 */
interface LoginInfoForSaving {
    userID: string,
    LoginTime: string,
    LampMAC: string,
    LampSN: string,
    isDayShift: boolean | undefined,
}
export default LoginInfoForSaving;