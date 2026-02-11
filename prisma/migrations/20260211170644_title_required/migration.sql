/*
  Warnings:

  - Made the column `title` on table `images` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[images] ALTER COLUMN [title] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[images] ADD CONSTRAINT [images_title_df] DEFAULT 'Sem titulo' FOR [title];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
