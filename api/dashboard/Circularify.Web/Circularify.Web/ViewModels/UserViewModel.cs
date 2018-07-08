using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Circularify.Web.ViewModels
{
    public class UserViewModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        // Private values below: (not shown in login).

        public DateTime LastLoggedIn { get; set; }

        public bool IsValid { get; set; }

        public List<string> ErrorMessage { get; set; } = new List<string>();
    }
}