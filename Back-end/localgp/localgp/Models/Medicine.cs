using System.Collections.Generic;

public class Medicine
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int StockQuantity { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    
    public ICollection<Order> Orders { get; set; }
}