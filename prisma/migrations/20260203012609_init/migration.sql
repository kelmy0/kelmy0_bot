BEGIN TRY

BEGIN TRAN;

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
CREATE TABLE [dbo].[guilds] (
    [guild_id] NVARCHAR(1000) NOT NULL,
    [guild_name] NVARCHAR(1000),
    [enabled] BIT NOT NULL CONSTRAINT [guilds_enabled_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [guilds_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2,
    [whitelist_mode] BIT NOT NULL CONSTRAINT [guilds_whitelist_mode_df] DEFAULT 0,
    CONSTRAINT [guilds_pkey] PRIMARY KEY CLUSTERED ([guild_id]),
    CONSTRAINT [guilds_guild_id_key] UNIQUE NONCLUSTERED ([guild_id])
);

-- CreateTable
CREATE TABLE [dbo].[guild_allowed_roles] (
    [role_id] NVARCHAR(1000) NOT NULL,
    [guild_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [guild_allowed_roles_pkey] PRIMARY KEY CLUSTERED ([role_id]),
    CONSTRAINT [guild_allowed_roles_guild_id_role_id_key] UNIQUE NONCLUSTERED ([guild_id],[role_id])
);

-- CreateTable
CREATE TABLE [dbo].[guild_admin_users] (
    [user_id] NVARCHAR(1000) NOT NULL,
    [guild_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [guild_admin_users_pkey] PRIMARY KEY CLUSTERED ([user_id]),
    CONSTRAINT [guild_admin_users_user_id_guild_id_key] UNIQUE NONCLUSTERED ([user_id],[guild_id])
);

-- CreateTable
CREATE TABLE [dbo].[allowed_channels] (
    [id] INT NOT NULL IDENTITY(1,1),
    [guild_id] NVARCHAR(1000) NOT NULL,
    [channel_id] NVARCHAR(1000) NOT NULL,
    [channel_name] NVARCHAR(1000),
    [channel_type] NVARCHAR(1000),
    [added_at] DATETIME2 NOT NULL CONSTRAINT [allowed_channels_added_at_df] DEFAULT CURRENT_TIMESTAMP,
    [added_by] NVARCHAR(1000),
    [reason] NVARCHAR(1000),
    CONSTRAINT [allowed_channels_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [allowed_channels_guild_id_channel_id_key] UNIQUE NONCLUSTERED ([guild_id],[channel_id])
);

-- CreateTable
CREATE TABLE [dbo].[allowed_channel_commands] (
    [id] INT NOT NULL IDENTITY(1,1),
    [command] NVARCHAR(1000) NOT NULL,
    [channel_id] INT NOT NULL,
    CONSTRAINT [allowed_channel_commands_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [allowed_channel_commands_command_channel_id_key] UNIQUE NONCLUSTERED ([command],[channel_id])
);

-- CreateTable
CREATE TABLE [dbo].[blocked_channels] (
    [id] INT NOT NULL IDENTITY(1,1),
    [guild_id] NVARCHAR(1000) NOT NULL,
    [channel_id] NVARCHAR(1000) NOT NULL,
    [channel_name] NVARCHAR(1000),
    [channel_type] NVARCHAR(1000),
    [blocked_at] DATETIME2 NOT NULL CONSTRAINT [blocked_channels_blocked_at_df] DEFAULT CURRENT_TIMESTAMP,
    [blocked_by] NVARCHAR(1000),
    [reason] NVARCHAR(1000),
    [block_all_commands] BIT NOT NULL CONSTRAINT [blocked_channels_block_all_commands_df] DEFAULT 0,
    CONSTRAINT [blocked_channels_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [blocked_channels_guild_id_channel_id_key] UNIQUE NONCLUSTERED ([guild_id],[channel_id])
);

-- CreateTable
CREATE TABLE [dbo].[blocked_channel_commands] (
    [id] INT NOT NULL IDENTITY(1,1),
    [command] NVARCHAR(1000) NOT NULL,
    [channel_id] INT NOT NULL,
    CONSTRAINT [blocked_channel_commands_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [blocked_channel_commands_command_channel_id_key] UNIQUE NONCLUSTERED ([command],[channel_id])
);

-- CreateTable
CREATE TABLE [dbo].[images] (
    [id] NVARCHAR(1000) NOT NULL,
    [url] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000),
    [description] NVARCHAR(1000),
    [category_id] INT NOT NULL,
    [added_by_id] NVARCHAR(1000) NOT NULL,
    [usage_count] INT NOT NULL CONSTRAINT [images_usage_count_df] DEFAULT 0,
    [tags] NVARCHAR(1000),
    [added_at] DATETIME2 NOT NULL CONSTRAINT [images_added_at_df] DEFAULT CURRENT_TIMESTAMP,
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

-- AddForeignKey
ALTER TABLE [dbo].[guild_allowed_roles] ADD CONSTRAINT [guild_allowed_roles_guild_id_fkey] FOREIGN KEY ([guild_id]) REFERENCES [dbo].[guilds]([guild_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[guild_admin_users] ADD CONSTRAINT [guild_admin_users_guild_id_fkey] FOREIGN KEY ([guild_id]) REFERENCES [dbo].[guilds]([guild_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[allowed_channels] ADD CONSTRAINT [allowed_channels_guild_id_fkey] FOREIGN KEY ([guild_id]) REFERENCES [dbo].[guilds]([guild_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[allowed_channel_commands] ADD CONSTRAINT [allowed_channel_commands_channel_id_fkey] FOREIGN KEY ([channel_id]) REFERENCES [dbo].[allowed_channels]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[blocked_channels] ADD CONSTRAINT [blocked_channels_guild_id_fkey] FOREIGN KEY ([guild_id]) REFERENCES [dbo].[guilds]([guild_id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[blocked_channel_commands] ADD CONSTRAINT [blocked_channel_commands_channel_id_fkey] FOREIGN KEY ([channel_id]) REFERENCES [dbo].[blocked_channels]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

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
