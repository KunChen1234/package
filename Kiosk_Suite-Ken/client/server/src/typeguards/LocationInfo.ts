/**
 * This interface used for information of Location;
 * locationName: The name of location;
 * BSSID: BSSID from mqtt;
 */
interface LocationInfo {
    locationName?: string | null | undefined;
    BSSID?: string | null | undefined;
}
export default LocationInfo;