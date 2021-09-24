using IdentityServer4.EntityFramework.Options;
using Microsoft.EntityFrameworkCore;
using SecurityTokenService.Extensions;

namespace SecurityTokenService.Data
{
    public class PersistedGrantDbContext : IdentityServer4.EntityFramework.DbContexts.PersistedGrantDbContext<
        PersistedGrantDbContext>
    {
        public PersistedGrantDbContext(DbContextOptions<PersistedGrantDbContext> options,
            OperationalStoreOptions storeOptions) : base(options, storeOptions)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.SetDefaultStringLength();

            if (!string.IsNullOrWhiteSpace(Constants.IdentityServerTablePrefix))
            {
                modelBuilder.SetTablePrefix(Constants.IdentityServerTablePrefix);
            }

            modelBuilder.SetSnakeCaseNaming();
        }
    }
}