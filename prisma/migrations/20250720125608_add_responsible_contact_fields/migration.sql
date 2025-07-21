-- AlterTable
ALTER TABLE "domain_requests" ADD COLUMN "responsibleContact" TEXT;
ALTER TABLE "domain_requests" ADD COLUMN "responsibleContactType" TEXT DEFAULT 'EMAIL';
