using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Channel_Management.API.Data;
using Channel_Management.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Channel_Management.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        public void ConfigureDevelopmentServices(IServiceCollection services)
        {
             var migrationsAssembly = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;
            services.AddDbContext<DBDataContext>(option =>
            {
                option.UseLazyLoadingProxies();
                option.UseSqlite(Configuration.GetConnectionString("defaultConnections"));
            });
            var builder = cofigurIdenttyServer(services);
            builder.AddConfigurationStore(options =>
            {
                options.ConfigureDbContext = builder =>
                               builder.UseSqlite(Configuration.GetConnectionString("defaultConnections"),sql => sql.MigrationsAssembly(migrationsAssembly));
            }
            ).AddOperationalStore(options =>
            {
                options.ConfigureDbContext = builder =>
                           builder.UseSqlite(Configuration.GetConnectionString("defaultConnections"),sql => sql.MigrationsAssembly(migrationsAssembly));
            });

            ConfigureServices(services);
        }
        public void ConfigureProductionServices(IServiceCollection services)
        {  var migrationsAssembly = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;
            services.AddDbContext<DBDataContext>(option =>
            {
                option.UseLazyLoadingProxies();
                option.UseSqlite(Configuration.GetConnectionString("defaultConnections"));
            });
             var builder = cofigurIdenttyServer(services);
            builder.AddConfigurationStore(options =>
            {
                options.ConfigureDbContext = builder =>
                               builder.UseSqlite(Configuration.GetConnectionString("defaultConnections"),sql => sql.MigrationsAssembly(migrationsAssembly));
            }
            ).AddOperationalStore(options =>
            {
                options.ConfigureDbContext = builder =>
                           builder.UseSqlite(Configuration.GetConnectionString("defaultConnections"),sql => sql.MigrationsAssembly(migrationsAssembly));
            });

            ConfigureServices(services);
        }
        public IIdentityServerBuilder cofigurIdenttyServer(IServiceCollection services)
        {
            var builder = services.AddIdentity<User, Role>(option =>
            {
                option.Password.RequireDigit = false;
                option.Password.RequiredLength = 4;
                option.Password.RequireUppercase = false;
                option.Password.RequireNonAlphanumeric = false;
            }).AddEntityFrameworkStores<DBDataContext>();

            var identityserver4Builder = services.AddIdentityServer(options =>
            {
                options.Events.RaiseErrorEvents = true;
                options.Events.RaiseInformationEvents = true;
                options.Events.RaiseFailureEvents = true;
                options.Events.RaiseSuccessEvents = true;
            }).AddAspNetIdentity<User>();
            identityserver4Builder.AddDeveloperSigningCredential();
            builder.AddDefaultTokenProviders();
            return identityserver4Builder;
        }
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers(opt =>
            {
                var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                opt.Filters.Add(new AuthorizeFilter(policy));
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseIdentityServer();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
