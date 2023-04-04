/*
  Warnings:

  - You are about to alter the column `totalTokens` on the `contents` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contents_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_contents" ("chatId", "content", "createdAt", "id", "role", "totalTokens") SELECT "chatId", "content", "createdAt", "id", "role", "totalTokens" FROM "contents";
DROP TABLE "contents";
ALTER TABLE "new_contents" RENAME TO "contents";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
