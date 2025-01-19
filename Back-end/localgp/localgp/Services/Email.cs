using System;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string message)
    {
        
        
        var smtpSettings = _configuration.GetSection("Email:Smtp");
        var host = smtpSettings.GetValue<string>("Host");
        var port = smtpSettings.GetValue<int>("Port");
        var enableSsl = smtpSettings.GetValue<bool>("EnableSsl");
        var userName = smtpSettings.GetValue<string>("Username");
        var password = smtpSettings.GetValue<string>("Password");
        var smtpClient = new SmtpClient(host)
        {
            Port = port,
            Credentials = new NetworkCredential(userName, password),
            EnableSsl = enableSsl
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(userName),
            Subject = subject,
            Body = message,
            IsBodyHtml = true,
        };
        mailMessage.To.Add(toEmail);
        try
        {
            await smtpClient.SendMailAsync(mailMessage);
            Console.WriteLine($"Email sent successfully to {toEmail}");
        }
        catch (SmtpException smtpEx)
        {
            Console.WriteLine($"SMTP Exception: {smtpEx.Message}");
            if (smtpEx.InnerException != null)
            {
                Console.WriteLine($"Inner Exception: {smtpEx.InnerException.Message}");
            }
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"General Exception: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }
}
