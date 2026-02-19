BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[images] (
    [id] NVARCHAR(1000) NOT NULL,
    [url] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL CONSTRAINT [images_title_df] DEFAULT 'Sem titulo',
    [description] NVARCHAR(1000),
    [category_id] NVARCHAR(1000) NOT NULL,
    [added_by_id] NVARCHAR(1000) NOT NULL,
    [tags] NVARCHAR(1000),
    [added_at] DATETIME2 NOT NULL CONSTRAINT [images_added_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [images_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [images_url_key] UNIQUE NONCLUSTERED ([url])
);

-- CreateTable
CREATE TABLE [dbo].[images_category] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [added_by_id] NVARCHAR(1000) NOT NULL,
    [added_at] DATETIME2 NOT NULL CONSTRAINT [images_category_added_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [images_category_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [images_category_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [discord_id] NVARCHAR(1000) NOT NULL,
    [discord_username] NVARCHAR(1000) NOT NULL,
    [discord_avatar] NVARCHAR(1000) NOT NULL CONSTRAINT [users_discord_avatar_df] DEFAULT 'https://cdn.discordapp.com/embed/avatars/0.png',
    [discord_global_name] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([discord_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [images_category_id_idx] ON [dbo].[images]([category_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [images_added_by_id_idx] ON [dbo].[images]([added_by_id]);

-- AddForeignKey
ALTER TABLE [dbo].[images] ADD CONSTRAINT [images_category_id_fkey] FOREIGN KEY ([category_id]) REFERENCES [dbo].[images_category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[images] ADD CONSTRAINT [images_added_by_id_fkey] FOREIGN KEY ([added_by_id]) REFERENCES [dbo].[users]([discord_id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
