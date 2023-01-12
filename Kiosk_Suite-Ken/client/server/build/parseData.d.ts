/// <reference types="node" />
import { Prisma, PrismaClient, RfidTags } from "@prisma/client";
import SerialPort from "serialport";
declare type PrismaClientInstance = PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;
/**
 *
 * @param {Bufer} data - Buffer output of RFID/NFC Scanner
 * @param {boolean} readTag - Boolean determining if the data is expected to be the encoded data from the NFC card.
 * @param {string | null} tagId - If readTag is true, this is the ID of the RFID/NFC card being read. Otherwise Null
 * @param {string} ipAddress - IP Address of the host machine
 * @param {PrismaClientInstance} prismaClient - The instance of the prisma client to read/write data.
 * @param {SerialPort} comPort - Serial port for reading/writing to the RFID reader
 * @returns {[string | null, boolean, RfidTags | null]} - Output for the rfid read.
 */
declare function parseData(data: Buffer, readTag: boolean, tagId: string | null, ipAddress: string, prismaClient: PrismaClientInstance, comPort: SerialPort): Promise<[string | null, boolean, RfidTags | null]>;
export default parseData;
