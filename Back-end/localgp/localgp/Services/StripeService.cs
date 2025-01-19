using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

using Stripe;

public class StripeService : IStripeService
{
    private readonly IConfiguration _configuration;

    public StripeService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> CreatePaymentIntent(decimal amount)
    {
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];

        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100), // Amount in cents
            Currency = "usd",
            PaymentMethodTypes = new List<string> { "card" },
        };

        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(options);

        return paymentIntent.ClientSecret;
    }
}