using System;
using System.ComponentModel.DataAnnotations;

namespace Circularify.Notifier.Db.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        public string Username { get; set; }

        public string Password { get; set; }

        public DateTimeOffset LastLoggedIn { get; set; }
    }
}