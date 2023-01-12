import AreaInfo from './AreaInfo';
import DepartmentInfo from './DepartmentInfo';
/**
 * This interface is used for select information from User table in database;
 * userID: Person's ID;
 * firstName: Person's firstName;
 * lastName: Person's LastName;
 * photo: Person's photo name, for example "Miner.png";
 * job: Person's job title;
 * areaName: Which area person work in;
 * departmentName: Which department person work in;
 * Area: Whole information of Area selected from Area table in database;
 * Department: Whole information of Department selected from Area table in database;
 */
interface resultOfUser {
    userID: string | null;
    firstName: string | null;
    lastName: string | null;
    photo: string | null;
    job: string | null;
    areaName: string | null;
    departmentName: string | null;
    Area: AreaInfo | null;
    Department: DepartmentInfo | null;
}
export { resultOfUser };