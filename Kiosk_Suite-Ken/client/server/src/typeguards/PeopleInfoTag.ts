/*
This interface used to save people information
ID: People ID number,
Section: which section people work in,
name: full name,
photo: src of photo,
job: job title,
date: date of sign in,
time: time of sign in,
isDayShift: nightshift or day shift.
*/
"use strict";
import DepartmentInfo from "./DepartmentInfo";
/**
 * This interface used for people information except personnel information from database; 
 * firstName: Person's firstName;
 * lastName: Person's LastName;
 * photo: Person's photo name, for example "Miner.png";
 * job: Person's job title;
 * areaName: Which area person work in;
 * departmentName: Which department person work in;
 * Area: Whole information of Area;
 * Department: Whole information of Department selected from Area table in database;
 */
interface PeopleInfoTag {
    ID: string | undefined | null;
    section: string | undefined | null;
    firstName: string | undefined | null;
    lastName: string | undefined | null;
    departmentName: string | undefined | null;
    photo: string | undefined | null;
    job: string | undefined | null;
}
export { PeopleInfoTag }