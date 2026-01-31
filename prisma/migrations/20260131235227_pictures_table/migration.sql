BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Pictures] (
    [id] INT NOT NULL IDENTITY(1,1),
    [url] NVARCHAR(1000) NOT NULL,
    [addedAt] DATETIME2 NOT NULL CONSTRAINT [Pictures_addedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [categoryId] INT NOT NULL,
    CONSTRAINT [Pictures_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PicturesCategory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PicturesCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PicturesCategory_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Pictures_categoryId_idx] ON [dbo].[Pictures]([categoryId]);

-- AddForeignKey
ALTER TABLE [dbo].[Pictures] ADD CONSTRAINT [Pictures_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[PicturesCategory]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
