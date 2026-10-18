-- CreateEnum
CREATE TYPE "CopyStatus" AS ENUM ('OnLoan', 'Available', 'Lost');

-- CreateTable
CREATE TABLE "Librarian" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Librarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "MembersNo" SERIAL NOT NULL,
    "MemberName" TEXT NOT NULL,
    "PhoneNumber" TEXT NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("MembersNo")
);

-- CreateTable
CREATE TABLE "BookList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,

    CONSTRAINT "BookList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopyBook" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "accessNumb" TEXT NOT NULL,
    "status" "CopyStatus" NOT NULL DEFAULT 'Available',

    CONSTRAINT "CopyBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "BookId" INTEGER NOT NULL,
    "Membersid" INTEGER NOT NULL,
    "LoanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DueDate" TIMESTAMP(3) NOT NULL,
    "ReturnData" TIMESTAMP(3),

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Librarian_email_key" ON "Librarian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CopyBook_accessNumb_key" ON "CopyBook"("accessNumb");

-- AddForeignKey
ALTER TABLE "CopyBook" ADD CONSTRAINT "CopyBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "BookList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_Membersid_fkey" FOREIGN KEY ("Membersid") REFERENCES "members"("MembersNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_BookId_fkey" FOREIGN KEY ("BookId") REFERENCES "CopyBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
