"use strict";
import { DeviceInfo } from "./DeviceInfo";
import { PeopleInfoTag } from "./PeopleInfoTag";
/*
person: save people information,
lamp: save lamp information.
*/
interface TagBoardInfo {
    person: PeopleInfoTag;
    lamp: DeviceInfo;
}
export { TagBoardInfo }