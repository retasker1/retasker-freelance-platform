-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortCode" TEXT NOT NULL DEFAULT 'ORD-0000',
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
INSERT INTO "new_orders" ("budgetCents", "category", "createdAt", "customerId", "deadline", "description", "id", "priority", "status", "tags", "title", "updatedAt", "workType") SELECT "budgetCents", "category", "createdAt", "customerId", "deadline", "description", "id", "priority", "status", "tags", "title", "updatedAt", "workType" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_shortCode_key" ON "orders"("shortCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
