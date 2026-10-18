-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('ACTIVE', 'ONLOAN', 'LOST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopiesBooks" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "Status" "BookStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "CopiesBooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "CbookId" INTEGER NOT NULL,
    "UserId" TEXT NOT NULL,
    "CreatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "SubmitDate" TIMESTAMP(3),
    "fineAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "findeDue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CopiesBooks_bookId_Status_idx" ON "CopiesBooks"("bookId", "Status");

-- CreateIndex
CREATE INDEX "Loan_UserId_idx" ON "Loan"("UserId");

-- CreateIndex
CREATE INDEX "Loan_CbookId_idx" ON "Loan"("CbookId");

-- AddForeignKey
ALTER TABLE "CopiesBooks" ADD CONSTRAINT "CopiesBooks_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_CbookId_fkey" FOREIGN KEY ("CbookId") REFERENCES "CopiesBooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
