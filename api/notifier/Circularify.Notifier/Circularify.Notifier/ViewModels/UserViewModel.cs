using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Circularify.Notifier.ViewModels
{
    public class UserViewModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        // Private values below: (not shown in login).

        public DateTimeOffset LastLoggedIn { get; set; }

        public bool IsValid { get; set; }

        public List<string> ErrorMessage { get; set; } = new List<string>();
    }
}