using System.Collections.Generic;
using IdentityServer4;
using IdentityServer4.Models;
using Newtonsoft.Json;

namespace Channel_Management.API
{
    public class config
    {
        public static IEnumerable<IdentityResource> GetAllResource()
        {
            return new List<IdentityResource>{
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
                };
        }
        public static IEnumerable<ApiResource>GetAllApi(){
            return new List<ApiResource>{
                new ApiResource{ Name="chmApi", DisplayName="Service Management Api"}
            };
        }
        public static IEnumerable<Client> GetAllClient(){
             var clientData = System.IO.File.ReadAllText("is4-config/client.json");
             var clients = JsonConvert.DeserializeObject<List<Client>>(clientData);
            return clients;
        }
    }

}