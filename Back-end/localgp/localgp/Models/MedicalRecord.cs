using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace localgp.Models
{
    public class MedicalRecord
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Patient")]
        public string PatientId { get; set; }
        public ApplicationUser Patient { get; set; }

        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
        public DateTime Date { get; set; }
    }
}
