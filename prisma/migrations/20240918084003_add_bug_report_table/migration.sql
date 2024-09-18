-- CreateTable
CREATE TABLE "BugReport" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "deviceModel" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,
    "osVersion" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "BugReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
