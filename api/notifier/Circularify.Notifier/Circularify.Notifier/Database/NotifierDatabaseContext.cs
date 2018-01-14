using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using Circularify.Notifier.Db.Models;

namespace Circularify.Notifier.Db
{
    public class NotifierDatabaseContext : DbContext
    {
        public DbSet<User> Users;

        public DbSet<Notification> Notifications;

        public NotifierDatabaseContext() : base("NotifierDatabaseContext")
        {
            Database.SetInitializer(new NotifierDatabaseInitializer());
            Database.Initialize(true);
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Prevent table names from ending with 'S'.
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }              
    }

    public class NotifierDatabaseInitializer: DropCreateDatabaseAlways<NotifierDatabaseContext>
    {
        protected override void Seed(NotifierDatabaseContext context)
        {
            // Add Dick.
            context.Users.Add(new User
            {
                Username = "dickwolff",
                Password = "Vlinder94"
            });
            // Add Martijn.
            context.Users.Add(new User
            {
                Username = "martijnlentink",
                Password = "supportinfo"
            });

            base.Seed(context);
        }
    }
}