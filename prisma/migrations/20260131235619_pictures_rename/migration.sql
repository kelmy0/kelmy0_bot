/*
  Warnings:

  - You are about to drop the `Pictures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PicturesCategory` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Pictures] DROP CONSTRAINT [Pictures_categoryId_fkey];

-- DropTable
DROP TABLE [dbo].[Pictures];

-- DropTable
DROP TABLE [dbo].[PicturesCategory];

-- CreateTable
CREATE TABLE [dbo].[pictures] (
    [id] INT NOT NULL IDENTITY(1,1),
    [url] NVARCHAR(1000) NOT NULL,
    [addedAt] DATETIME2 NOT NULL CONSTRAINT [pictures_addedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [categoryId] INT NOT NULL,
    CONSTRAINT [pictures_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[pictures_category] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [pictures_category_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [pictures_category_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [pictures_categoryId_idx] ON [dbo].[pictures]([categoryId]);

-- AddForeignKey
ALTER TABLE [dbo].[pictures] ADD CONSTRAINT [pictures_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[pictures_category]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
