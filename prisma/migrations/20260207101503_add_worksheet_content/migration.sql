-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Worksheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '{}',
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Worksheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Worksheet" ("createdAt", "difficulty", "id", "pdfUrl", "topic", "userId") SELECT "createdAt", "difficulty", "id", "pdfUrl", "topic", "userId" FROM "Worksheet";
DROP TABLE "Worksheet";
ALTER TABLE "new_Worksheet" RENAME TO "Worksheet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
