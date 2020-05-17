using System.Collections.Generic;
using IdentityServer4;
using IdentityServer4.Models;
using Newtonsoft.Json;

namespace Channel_Management.API
{
    public class config
    {
       public static IEnumerable<ApiResource> getApiResource(){
            return new List<ApiResource>{
                new ApiResource("chmApi", "channel management api")
            };
        }
        public static IEnumerable<Client> GetClients(){
            return new List<Client> {
                new Client {
    ClientId = "chmUi",
    ClientName = "chmUi",
    AllowedGrantTypes = GrantTypes.Code,
    AllowedScopes = new List<string> { "openid", "profile", "chmApi" },
    RedirectUris = new List<string> { "http://localhost:4200/pages/auth-callback" },
    PostLogoutRedirectUris = new List<string> { "http://localhost:4200/" },
    AllowedCorsOrigins = new List<string> { "http://localhost:4200" },
    AllowAccessTokensViaBrowser = true,
    RequirePkce = true,
    RequireClientSecret = false,
}
                
            };
        }
        public static List<IdentityResource> GetIdentityResources()
{
    return new List<IdentityResource>
    {
        new IdentityResources.OpenId(),
        new IdentityResources.Profile() // <-- usefull
    };
}
    }

}