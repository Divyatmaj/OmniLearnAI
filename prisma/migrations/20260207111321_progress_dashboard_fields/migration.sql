-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "xpPoints" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT NOT NULL DEFAULT '[]',
    "topicsStudied" TEXT NOT NULL DEFAULT '[]',
    "worksheetsGenerated" INTEGER NOT NULL DEFAULT 0,
    "studyPlansCreated" INTEGER NOT NULL DEFAULT 0,
    "weaknesses" TEXT NOT NULL DEFAULT '[]',
    "analytics" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Progress" ("analytics", "badges", "id", "updatedAt", "userId", "weaknesses", "xpPoints") SELECT "analytics", "badges", "id", "updatedAt", "userId", "weaknesses", "xpPoints" FROM "Progress";
DROP TABLE "Progress";
ALTER TABLE "new_Progress" RENAME TO "Progress";
CREATE UNIQUE INDEX "Progress_userId_key" ON "Progress"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
