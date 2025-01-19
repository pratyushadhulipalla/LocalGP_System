using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

public class ZoomService
{
    private readonly HttpClient _httpClient;
    private readonly string _clientId;
    private readonly string _clientSecret;

    public ZoomService(IConfiguration configuration)
    {
        _httpClient = new HttpClient();
        _clientId = configuration["Zoom:ClientId"];
        _clientSecret = configuration["Zoom:ClientSecret"];
    }

    public async Task<string> CreateZoomMeetingAsync(DateTime startTime, string topic, string duration, string password)
    {
        // Get the access token
        var accessToken = await GetZoomAccessTokenAsync();

        // Check if the token was successfully retrieved
        if (string.IsNullOrEmpty(accessToken))
        {
            throw new Exception("Failed to retrieve Zoom access token.");
        }

        // Setup the meeting creation request
        var requestContent = new StringContent(JsonConvert.SerializeObject(new
        {
            topic = topic,
            type = 2,  // Scheduled meeting
            start_time = startTime.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            duration = duration,
            password = password,
            settings = new
            {
                join_before_host = true,
                mute_upon_entry = true,
                approval_type = 0,  // No registration required
                waiting_room = false // Disable waiting room
            }
        }), Encoding.UTF8, "application/json");

        // Create the HTTP request for Zoom
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.zoom.us/v2/users/me/meetings")
        {
            Content = requestContent
        };

        // Add the Authorization Bearer header with the access token
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Send the request
        var response = await _httpClient.SendAsync(request);

        // Check if the response is successful
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Failed to create Zoom meeting: {errorContent}");
            throw new Exception($"Failed to create Zoom meeting: {errorContent}");
        }

        // Read and deserialize the response
        var responseContent = await response.Content.ReadAsStringAsync();
        var createdMeeting = JsonConvert.DeserializeObject<ZoomMeetingResponse>(responseContent);

        // Return the join URL for the created meeting
        return createdMeeting.JoinUrl;
    }

    public async Task<string> GetZoomAccessTokenAsync()
    {
        // Prepare the credentials for Basic Authorization
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_clientId}:{_clientSecret}"));

        var request = new HttpRequestMessage(HttpMethod.Post, "https://zoom.us/oauth/token")
        {
            Content = new StringContent("grant_type=client_credentials", Encoding.UTF8, "application/x-www-form-urlencoded")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        var response = await _httpClient.SendAsync(request);

        var responseContent = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Failed to obtain Zoom access token: {responseContent}");
            throw new Exception($"Failed to obtain Zoom access token: {responseContent}");
        }

        var tokenResponse = JsonConvert.DeserializeObject<ZoomTokenResponse>(responseContent);

        return tokenResponse.AccessToken;
    }

    public async Task<bool> ValidateZoomTokenAsync(string accessToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "https://api.zoom.us/v2/users/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.SendAsync(request);
        return response.IsSuccessStatusCode;
    }

    public class ZoomTokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonProperty("token_type")]
        public string TokenType { get; set; }
    }

    public class ZoomMeetingResponse
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("join_url")]
        public string JoinUrl { get; set; }
    }
}
