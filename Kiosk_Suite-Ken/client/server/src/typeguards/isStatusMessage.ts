"use strict";
interface statusMessage {
    charging: number;
    ssid: string;
    bssid: string;
    rssi: number;
    operationMode: string;
    runtime: number;
    time: number;
    ipAddress: string;
    APN: string;
    fuelRaw: number;
    fuelSOC: number;
    fuelConfig: number;
    fuelMode: number;
    ledStatus: number;
    storage: Array<number>;
}

function isStatusMessage(obj: unknown): obj is statusMessage {
    if (typeof obj === "object") {
        const parse = obj as Record<string, unknown>;
        return "charging" in parse && typeof parse.charging === "number" &&
            "ssid" in parse && typeof parse.ssid === "string" &&
            "bssid" in parse && typeof parse.bssid === "string" &&
            "rssi" in parse && typeof parse.rssi === "number" &&
            "operationMode" in parse && typeof parse.operationMode === "string" &&
            "runtime" in parse && typeof parse.runtime === "number" &&
            "time" in parse && typeof parse.time === "number" &&
            "ipAddress" in parse && typeof parse.ipAddress === "string" &&
            "APN" in parse && typeof parse.APN === "string" &&
            "fuelRaw" in parse && typeof parse.fuelRaw === "number" &&
            "fuelSOC" in parse && typeof parse.fuelSOC === "number" &&
            "fuelConfig" in parse && typeof parse.fuelConfig === "number" &&
            "fuelMode" in parse && typeof parse.fuelMode === "number" &&
            "ledStatus" in parse && typeof parse.ledStatus === "number" &&
            "storage" in parse && Array.isArray(parse.storage) &&
            parse.storage.every(item => typeof item === "number");
    } else {
        return false;
    }
}

export { statusMessage, isStatusMessage }