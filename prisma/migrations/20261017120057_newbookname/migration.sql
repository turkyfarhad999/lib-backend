/*
  Warnings:

  - You are about to drop the `AdminUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CopyBook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Librarian` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CopyBook" DROP CONSTRAINT "CopyBook_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_BookId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_Membersid_fkey";

-- DropTable
DROP TABLE "AdminUser";

-- DropTable
DROP TABLE "BookList";

-- DropTable
DROP TABLE "CopyBook";

-- DropTable
DROP TABLE "Librarian";

-- DropTable
DROP TABLE "Loan";

-- DropTable
DROP TABLE "members";

-- DropEnum
DROP TYPE "CopyStatus";

-- CreateTable
CREATE TABLE "Books" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Author" TEXT NOT NULL,

    CONSTRAINT "Books_pkey" PRIMARY KEY ("id")
);
