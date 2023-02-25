-- CreateTable
CREATE TABLE "User" (
    "id" INT4 NOT NULL DEFAULT unique_rowid(),
    "email" STRING NOT NULL,
    "name" STRING,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INT4 NOT NULL DEFAULT unique_rowid(),
    "title" STRING NOT NULL,
    "content" STRING,
    "published" BOOL DEFAULT false,
    "authorId" INT4,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
