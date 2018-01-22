using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using Circularify.Web.Db.Models;

namespace Circularify.Web.Db
{
    public class NotifierDatabaseContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        public NotifierDatabaseContext() : base("name=NotifierDatabaseContext")
        {
            //Database.SetInitializer(new NotifierDatabaseInitializer());            
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Prevent table names from ending with 'S'.
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }              
    }

    public class NotifierDatabaseInitializer: DropCreateDatabaseIfModelChanges<NotifierDatabaseContext>
    {
        protected override void Seed(NotifierDatabaseContext context)
        {
            // Add Dick.
            context.Users.Add(new User
            {
                Username = "dickwolff",
                Password = System.Guid.NewGuid().ToString("N")
            });
            // Add Martijn.
            context.Users.Add(new User
            {
                Username = "martijnlentink",
                Password = System.Guid.NewGuid().ToString("N")
            });

            base.Seed(context);
        }
    }
}