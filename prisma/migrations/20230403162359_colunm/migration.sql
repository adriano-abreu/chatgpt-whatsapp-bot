/*
  Warnings:

  - Added the required column `tokenSize` to the `chat` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenSize" INTEGER NOT NULL,
    "chatsId" TEXT,
    CONSTRAINT "chat_chatsId_fkey" FOREIGN KEY ("chatsId") REFERENCES "user_chats" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_chat" ("chatsId", "id") SELECT "chatsId", "id" FROM "chat";
DROP TABLE "chat";
ALTER TABLE "new_chat" RENAME TO "chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
