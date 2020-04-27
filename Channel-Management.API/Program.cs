using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Channel_Management.API.Data;
using Channel_Management.API.Models;
using IdentityServer4.EntityFramework.DbContexts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Channel_Management.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = CreateHostBuilder(args).Build();
            using (var scope = builder.Services.CreateScope())
            {
                DBDataContext dBDataContext = scope.ServiceProvider.GetRequiredService<DBDataContext>();
                PersistedGrantDbContext persistedGrantDbContext = scope.ServiceProvider.GetRequiredService<PersistedGrantDbContext>();
                ConfigurationDbContext configurationDbContext = scope.ServiceProvider.GetRequiredService<ConfigurationDbContext>();
                var userManager=scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                var roleManager=scope.ServiceProvider.GetRequiredService<RoleManager<Role>>();

                dBDataContext.Database.Migrate();
                persistedGrantDbContext.Database.Migrate();
                Seed.SeedConfigurationDb(configurationDbContext);
                Seed.SeedUser(userManager,roleManager);

            }

            builder.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
