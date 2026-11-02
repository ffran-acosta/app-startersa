-- CreateEnum
CREATE TYPE "TodoStatus" AS ENUM ('PENDING', 'DONE');

-- CreateTable
CREATE TABLE "todos" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000),
    "status" "TodoStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todos_ownerId_createdAt_idx" ON "todos"("ownerId", "createdAt");
