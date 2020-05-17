using Channel_Management.API.Models;
using IdentityServer4.EntityFramework.DbContexts;
using IdentityServer4.EntityFramework.Mappers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace Channel_Management.API.Data
{
    public class Seed
    {
        public static  void SeedConfigurationDb(ConfigurationDbContext configurationDb){
          
if (!configurationDb.Clients.Any())
            {
                foreach (var client in config.GetClients())
                {
                    configurationDb.Clients.Add(client.ToEntity());
                }
                configurationDb.SaveChanges();
            }

            if (!configurationDb.IdentityResources.Any())
            {
                foreach (var resource in config.GetIdentityResources())
                {
                    configurationDb.IdentityResources.Add(resource.ToEntity());
                }
                configurationDb.SaveChanges();
            }

            if (!configurationDb.ApiResources.Any())
            {
                foreach (var resource in config.getApiResource())
                {
                    configurationDb.ApiResources.Add(resource.ToEntity());
                }
                configurationDb.SaveChanges();
            }
            
        }
        public static void SeedUser(UserManager<User> userManager,RoleManager<Role> roleManager){
            
            if(!userManager.Users.AnyAsync().Result){
                var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);
                var roles = new List<Role>{
                    new Role{Name="Member"},
                    new Role{Name="Admin"},
                    new Role{Name="Moderator"},
                    new Role{Name="VIP"}};

                foreach (var role in roles)
                {
                   roleManager.CreateAsync(role).Wait();
                }
                foreach (var user in users)
                {
                    userManager.CreateAsync(user,"password").Wait();
                   userManager.AddToRoleAsync(user,"Member").Wait();
                }
                var adminUser = new User { UserName = "admin" };
                var result = userManager.CreateAsync(adminUser, "password").Result;
                if (result.Succeeded)
                {
                    var createdAdmin = userManager.FindByNameAsync("admin").Result;
                    userManager.AddToRolesAsync(createdAdmin, new[] { "Admin", "Moderator" });
                }
            }
        }
       
    
    }
}