-- CreateTable
CREATE TABLE "ParkingTransaction" (
    "id" TEXT NOT NULL,
    "parkingServiceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "group" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParkingTransaction_parkingServiceId_date_serviceName_idx" ON "ParkingTransaction"("parkingServiceId", "date", "serviceName");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingTransaction_parkingServiceId_date_serviceName_group_key" ON "ParkingTransaction"("parkingServiceId", "date", "serviceName", "group");

-- AddForeignKey
ALTER TABLE "ParkingTransaction" ADD CONSTRAINT "ParkingTransaction_parkingServiceId_fkey" FOREIGN KEY ("parkingServiceId") REFERENCES "ParkingService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
