
"use strict";
/*
MAC: MAC address,
SN: serial number,
Bssid: bssid from mqtt,
ChargingStatus: the lamp  charging or not.
*/
interface DeviceInfo {
    MAC: string | undefined | null;
    SN: string | undefined | null;
    Bssid: string | undefined | null;
    ChargingStatus: boolean | undefined | null;
    updateTime: string | undefined;
}
export { DeviceInfo }