-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_domain_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL DEFAULT 'unknown',
    "requesterName" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "institution" TEXT,
    "contact" TEXT NOT NULL,
    "contactType" TEXT NOT NULL DEFAULT 'EMAIL',
    "responsibleContact" TEXT NOT NULL DEFAULT 'unknown',
    "responsibleContactType" TEXT NOT NULL DEFAULT 'EMAIL',
    "machineAdminName" TEXT,
    "machineAdminPosition" TEXT,
    "machineAdminContact" TEXT,
    "machineAdminContactType" TEXT,
    "machineRoom" TEXT,
    "machinePlace" TEXT,
    "property" TEXT NOT NULL DEFAULT 'InNSTRU',
    "useType" TEXT NOT NULL DEFAULT 'NoSever',
    "purpose" TEXT NOT NULL DEFAULT 'None',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationType" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalCooldownAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "domain_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_domain_requests" ("approvalCooldownAt", "contact", "contactType", "department", "domain", "durationType", "expiresAt", "id", "ipAddress", "machineAdminContact", "machineAdminContactType", "machineAdminName", "machineAdminPosition", "machinePlace", "machineRoom", "property", "purpose", "requestedAt", "requesterName", "responsibleContact", "responsibleContactType", "responsibleName", "status", "useType", "userId") SELECT "approvalCooldownAt", "contact", "contactType", "department", "domain", "durationType", "expiresAt", "id", "ipAddress", "machineAdminContact", "machineAdminContactType", "machineAdminName", "machineAdminPosition", "machinePlace", "machineRoom", coalesce("property", 'InNSTRU') AS "property", coalesce("purpose", 'None') AS "purpose", "requestedAt", "requesterName", "responsibleContact", "responsibleContactType", "responsibleName", "status", coalesce("useType", 'NoSever') AS "useType", "userId" FROM "domain_requests";
DROP TABLE "domain_requests";
ALTER TABLE "new_domain_requests" RENAME TO "domain_requests";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
