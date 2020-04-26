using Channel_Management.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Channel_Management.API.Data
{
    public class DBDataContext :IdentityDbContext<User,Role,int,IdentityUserClaim<int>,IdentityUserRole<int>,
    IdentityUserLogin<int>,IdentityRoleClaim<int>,IdentityUserToken<int>>
    {
        public DBDataContext(DbContextOptions<DBDataContext> option):base(option){}
        protected override void OnModelCreating(ModelBuilder builder){
            base.OnModelCreating(builder);
        }
    }
}