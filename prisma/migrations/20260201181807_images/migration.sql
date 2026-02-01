/*
  Warnings:

  - You are about to drop the `pictures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pictures_category` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[pictures] DROP CONSTRAINT [pictures_categoryId_fkey];

-- DropTable
DROP TABLE [dbo].[pictures];

-- DropTable
DROP TABLE [dbo].[pictures_category];

-- CreateTable
CREATE TABLE [dbo].[users] (
    [discord_id] NVARCHAR(1000) NOT NULL,
    [discord_username] NVARCHAR(1000) NOT NULL,
    [discord_avatar] NVARCHAR(1000),
    [discord_global_name] NVARCHAR(1000),
    [discord_discriminator] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([discord_id])
);

-- CreateTable
CREATE TABLE [dbo].[images] (
    [id] NVARCHAR(1000) NOT NULL,
    [url] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [category_id] INT NOT NULL,
    [added_by_id] NVARCHAR(1000) NOT NULL,
    [tags] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [images_status_df] DEFAULT 'PENDING',
    [added_at] DATETIME2 NOT NULL CONSTRAINT [images_added_at_df] DEFAULT CURRENT_TIMESTAMP,
    [approved_at] DATETIME2,
    [approved_by_id] NVARCHAR(1000),
    [usage_count] INT NOT NULL CONSTRAINT [images_usage_count_df] DEFAULT 0,
    [userId] NVARCHAR(1000),
    CONSTRAINT [images_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [images_url_key] UNIQUE NONCLUSTERED ([url])
);

-- CreateTable
CREATE TABLE [dbo].[images_category] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [added_by_id] NVARCHAR(1000) NOT NULL,
    [added_at] DATETIME2 NOT NULL CONSTRAINT [images_category_added_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [images_category_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [images_category_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [images_category_id_idx] ON [dbo].[images]([category_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [images_added_by_id_idx] ON [dbo].[images]([added_by_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [images_status_idx] ON [dbo].[images]([status]);

-- AddForeignKey
ALTER TABLE [dbo].[images] ADD CONSTRAINT [images_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[images_category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[images] ADD CONSTRAINT [images_added_by_id_fkey] FOREIGN KEY ([added_by_id]) REFERENCES [dbo].[users]([discord_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[images] ADD CONSTRAINT [images_approved_by_id_fkey] FOREIGN KEY ([approved_by_id]) REFERENCES [dbo].[users]([discord_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[images] ADD CONSTRAINT [images_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([discord_id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[images_category] ADD CONSTRAINT [images_category_added_by_id_fkey] FOREIGN KEY ([added_by_id]) REFERENCES [dbo].[users]([discord_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
