"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const fs_1 = require("fs");
const path_1 = require("path");
const short_uuid_1 = __importDefault(require("short-uuid"));
/**
 * Sets configs to be used in the application.
 * @returns void
 */
function setConfigs() {
    const translator = (0, short_uuid_1.default)();
    const confDir = (0, path_1.normalize)(`${__dirname}/../config`);
    const envPath = (0, path_1.normalize)(`${__dirname}/../.env`);
    let id;
    if (!(0, fs_1.existsSync)(`${confDir}/local.json`)) {
        id = translator.uuid();
        const data = {
            "id": id,
            "shortId": translator.fromUUID(id)
        };
        (0, fs_1.writeFileSync)(`${confDir}/local.json`, JSON.stringify(data, null, 4));
    }
    else {
        id = config_1.default.get("id");
    }
    // const shortId = translator.fromUUID(id);
    if ((0, fs_1.existsSync)(envPath)) {
        (0, fs_1.unlinkSync)(envPath);
    }
    (0, fs_1.writeFileSync)(envPath, `DATABASE_URL=${config_1.default.get("dbConfig.dbUrl")}`);
    process.env.DATABASE_URL = config_1.default.get("dbConfig.dbUrl");
    return id;
}
exports.default = setConfigs;
//# sourceMappingURL=config.js.map