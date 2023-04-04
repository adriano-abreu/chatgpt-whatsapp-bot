/*
  Warnings:

  - The primary key for the `contents` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contents" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contents_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_contents" ("chatId", "content", "createdAt", "id", "role") SELECT "chatId", "content", "createdAt", "id", "role" FROM "contents";
DROP TABLE "contents";
ALTER TABLE "new_contents" RENAME TO "contents";
CREATE INDEX "createdAt" ON "contents"("createdAt");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
