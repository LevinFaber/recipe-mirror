/*
  Warnings:

  - You are about to drop the `TagAssignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TagAssignments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TagAssignment" (
    "tagId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,

    PRIMARY KEY ("tagId", "recipeId"),
    CONSTRAINT "TagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TagAssignment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TagAssignment_tagId_key" ON "TagAssignment"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "TagAssignment_recipeId_key" ON "TagAssignment"("recipeId");
