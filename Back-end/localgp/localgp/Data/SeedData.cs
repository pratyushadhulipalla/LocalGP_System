using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading.Tasks;
using localgp.Models;

namespace localgp.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider, UserManager<ApplicationUser> userManager)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Define roles
            string[] roleNames = { "Admin", "Doctor", "Patient" };
            IdentityResult roleResult;

            foreach (var roleName in roleNames)
            {
                // Check if the role already exists
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    // Create the role
                    roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
                    if (!roleResult.Succeeded)
                    {
                        throw new Exception($"Failed to create role: {roleName}");
                    }
                }
            }

            // Assign roles to users
            if (userManager.Users.All(u => u.UserName != "admin"))
            {
                var adminUser = new ApplicationUser
                {
                    UserName = "admin",
                    Email = "localgpteam.staff@gmail.com",
                    FirstName = "Admin",
                    LastName = "User",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");

                if (result.Succeeded)
                {
                    var addToRoleResult = await userManager.AddToRoleAsync(adminUser, "Admin");
                    if (!addToRoleResult.Succeeded)
                    {
                        throw new Exception("Failed to add admin user to Admin role");
                    }
                }
                else
                {
                    throw new Exception("Failed to create admin user");
                }
            }

            if (userManager.Users.All(u => u.UserName != "doctor"))
            {
                var doctorUser = new ApplicationUser
                {
                    UserName = "doctor",
                    Email = "doctor@localhost",
                    FirstName = "Doctor",
                    LastName = "User",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(doctorUser, "Doctor123!");

                if (result.Succeeded)
                {
                    var addToRoleResult = await userManager.AddToRoleAsync(doctorUser, "Doctor");
                    if (!addToRoleResult.Succeeded)
                    {
                        throw new Exception("Failed to add doctor user to Doctor role");
                    }
                }
                else
                {
                    throw new Exception("Failed to create doctor user");
                }
            }

            if (userManager.Users.All(u => u.UserName != "patient"))
            {
                var patientUser = new ApplicationUser
                {
                    UserName = "patient",
                    Email = "patient@localhost",
                    FirstName = "Patient",
                    LastName = "User",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(patientUser, "Patient123!");

                if (result.Succeeded)
                {
                    var addToRoleResult = await userManager.AddToRoleAsync(patientUser, "Patient");
                    if (!addToRoleResult.Succeeded)
                    {
                        throw new Exception("Failed to add patient user to Patient role");
                    }
                }
                else
                {
                    throw new Exception("Failed to create patient user");
                }
            }
        }
    }
}
