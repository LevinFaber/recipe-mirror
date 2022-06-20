/*
  Warnings:

  - The primary key for the `Ingredient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `index` on the `Ingredient` table. All the data in the column will be lost.
  - The primary key for the `Instruction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `index` on the `Instruction` table. All the data in the column will be lost.
  - Added the required column `position` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Instruction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "recipeId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    PRIMARY KEY ("recipeId", "position"),
    CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ingredient" ("recipeId", "text") SELECT "recipeId", "text" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE TABLE "new_Instruction" (
    "recipeId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    PRIMARY KEY ("recipeId", "position"),
    CONSTRAINT "Instruction_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Instruction" ("recipeId", "text", "title") SELECT "recipeId", "text", "title" FROM "Instruction";
DROP TABLE "Instruction";
ALTER TABLE "new_Instruction" RENAME TO "Instruction";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
