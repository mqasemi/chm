using Microsoft.AspNetCore.Identity;

namespace Channel_Management.API.Models
{
    public class User : IdentityUser<int>
    {
        public string FirstName { get; set; }   
        public string LastName { get; set; }    
        public string PersonelNo { get; set; }
        public string PersonelId { get; set; }
        public string  Domain { get; set; } 
        public Gender gender { get; set; }
        public string MobileNumber { get; set; }    
        public string BirthDate { get; set; }   
        public string National_id { get; set; }
        public string JOB_START_DATE { get; set; }

    }
}