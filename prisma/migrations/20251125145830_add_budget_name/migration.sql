/*
  Warnings:

  - Added the required column `name` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "name" TEXT;

UPDATE "Budget" SET "name" = 'Presupuesto ' || "id" WHERE "name" IS NULL;

ALTER TABLE "Budget" ALTER COLUMN "name" SET NOT NULL;
