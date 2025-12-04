/*
  Warnings:

  - A unique constraint covering the columns `[cognitoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cognitoId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Primero agregar la columna como nullable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cognitoId" TEXT;

-- Actualizar registros existentes con un valor temporal basado en su ID
UPDATE "User" 
SET "cognitoId" = 'temp_' || "id" 
WHERE "cognitoId" IS NULL;

-- Ahora hacer la columna NOT NULL
ALTER TABLE "User" ALTER COLUMN "cognitoId" SET NOT NULL;

-- CreateIndex: Crear el índice único
CREATE UNIQUE INDEX IF NOT EXISTS "User_cognitoId_key" ON "User"("cognitoId");
