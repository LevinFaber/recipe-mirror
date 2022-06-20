/*
  Warnings:

  - You are about to drop the `_RecipeToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_RecipeToTag";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TagAssignments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tagId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    CONSTRAINT "TagAssignments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TagAssignments_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TagAssignments_tagId_key" ON "TagAssignments"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "TagAssignments_recipeId_key" ON "TagAssignments"("recipeId");
