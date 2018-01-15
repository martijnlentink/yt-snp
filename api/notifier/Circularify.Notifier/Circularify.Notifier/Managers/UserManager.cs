using System;
using System.Linq;
using Circularify.Web.Db;
using Circularify.Web.ViewModels;

namespace Circularify.Web.Managers
{
    public class UserManager
    {
        private NotifierDatabaseContext _db;

        public UserManager()
        {
            _db = DbInstance.Get;
        }

        public UserViewModel ValidateUser(UserViewModel model)
        {
            // Check if the user is in the database.
            var userInDatabase = _db.Users.SingleOrDefault(u => u.Username == model.Username);

            var validatedUser = new UserViewModel
            {
                IsValid = true
            };

            // If no result is returned, the user is not in the database.
            if (userInDatabase == null)
            {
                validatedUser.IsValid = false;
                validatedUser.ErrorMessage.Add("User is not in the system.");
            }

            // Check if the password is the same.
            if (validatedUser.IsValid && userInDatabase.Password != model.Password)
            {
                validatedUser.IsValid = false;
                validatedUser.ErrorMessage.Add("User - Password combination is not recognized.");
            }

            // If the code gets here, the user is in the database and the password is correct.
            if (validatedUser.IsValid)
            {
                validatedUser.Username = model.Username;
                validatedUser.Password = model.Password;
                validatedUser.LastLoggedIn = userInDatabase.LastLoggedIn.Value;
            }

            // Update the lastLoggedIn.
            userInDatabase.LastLoggedIn = DateTime.Now;
            _db.SaveChanges();

            return validatedUser;
        }
    }
}