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
        public static  void SeedConfigurationDb(ConfigurationDbContext context){
            context.Database.Migrate();
            foreach (var client in config.GetAllClient())  
            {
                if(! context.Clients.AnyAsync(cl=>cl.ClientId==client.ClientId).Result){
                    context.Clients.Add(client.ToEntity());
                }
                
            }
            foreach (var api in config.GetAllApi())
            {
                if(! context.ApiResources.AnyAsync(ap=>ap.Name==api.Name).Result){
                    context.ApiResources.Add(api.ToEntity());
                }
            }
             foreach (var iresource in config.GetAllResource())
             {
                 if(! context.IdentityResources.AnyAsync(ir=>ir.Name==iresource.Name).Result){
                    context.Add(iresource.ToEntity());
                }
             }
            context.SaveChanges();
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