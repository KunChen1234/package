-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "areaName" TEXT,
    "areaColor" TEXT,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userID" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "photo" TEXT NOT NULL DEFAULT E'miner.png',
    "job" TEXT,
    "areaName" TEXT,
    "departmentName" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "departmentName" TEXT,
    "departmentColor" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginInfo" (
    "id" SERIAL NOT NULL,
    "userID" TEXT NOT NULL,
    "LoginTime" TEXT NOT NULL,
    "LampMAC" TEXT NOT NULL,
    "LampSN" TEXT NOT NULL,
    "LampBssid" TEXT,
    "LastUpdateTime" TEXT,
    "isDayShift" BOOLEAN NOT NULL,

    CONSTRAINT "LoginInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "locationName" TEXT,
    "BSSID" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_areaName_key" ON "Area"("areaName");

-- CreateIndex
CREATE UNIQUE INDEX "User_userID_key" ON "User"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Department_departmentName_key" ON "Department"("departmentName");

-- CreateIndex
CREATE UNIQUE INDEX "Location_BSSID_key" ON "Location"("BSSID");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaName_fkey" FOREIGN KEY ("areaName") REFERENCES "Area"("areaName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentName_fkey" FOREIGN KEY ("departmentName") REFERENCES "Department"("departmentName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginInfo" ADD CONSTRAINT "LoginInfo_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginInfo" ADD CONSTRAINT "LoginInfo_LampBssid_fkey" FOREIGN KEY ("LampBssid") REFERENCES "Location"("BSSID") ON DELETE SET NULL ON UPDATE CASCADE;
