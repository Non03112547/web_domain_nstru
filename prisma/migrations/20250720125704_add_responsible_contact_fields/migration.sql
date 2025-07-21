-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_domain_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "contactType" TEXT NOT NULL DEFAULT 'EMAIL',
    "responsibleContact" TEXT NOT NULL DEFAULT 'unknown',
    "responsibleContactType" TEXT NOT NULL DEFAULT 'EMAIL',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationType" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalCooldownAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "domain_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_domain_requests" ("approvalCooldownAt", "contact", "contactType", "department", "domain", "durationType", "expiresAt", "id", "ipAddress", "purpose", "requestedAt", "requesterName", "responsibleContact", "responsibleContactType", "responsibleName", "status", "userId") SELECT "approvalCooldownAt", "contact", "contactType", "department", "domain", "durationType", "expiresAt", "id", "ipAddress", "purpose", "requestedAt", "requesterName", coalesce("responsibleContact", 'unknown') AS "responsibleContact", coalesce("responsibleContactType", 'EMAIL') AS "responsibleContactType", "responsibleName", "status", "userId" FROM "domain_requests";
DROP TABLE "domain_requests";
ALTER TABLE "new_domain_requests" RENAME TO "domain_requests";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
