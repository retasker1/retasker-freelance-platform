-- AlterTable
ALTER TABLE "users" ADD COLUMN "authToken" TEXT;
ALTER TABLE "users" ADD COLUMN "tokenExpiresAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "category" TEXT NOT NULL DEFAULT 'other',
    "deadline" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "workType" TEXT NOT NULL DEFAULT 'FIXED',
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("budgetCents", "category", "createdAt", "customerId", "deadline", "description", "id", "status", "title", "updatedAt") SELECT "budgetCents", "category", "createdAt", "customerId", "deadline", "description", "id", "status", "title", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
