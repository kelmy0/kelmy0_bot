/*
  Warnings:

  - Made the column `discord_avatar` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[users] ALTER COLUMN [discord_avatar] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_discord_avatar_df] DEFAULT 'https://cdn.discordapp.com/embed/avatars/0.png' FOR [discord_avatar];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
