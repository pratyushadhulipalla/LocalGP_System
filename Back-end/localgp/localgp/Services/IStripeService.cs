using System.Threading.Tasks;

public interface IStripeService
{
    Task<string> CreatePaymentIntent(decimal amount);
}