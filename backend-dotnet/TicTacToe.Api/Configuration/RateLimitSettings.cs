namespace TicTacToe.Api.Configuration;

public class RateLimitSettings
{
    public bool EnableRateLimiting { get; set; } = true;
    public int PermitLimit { get; set; } = 100;
    public int WindowInSeconds { get; set; } = 60;
}
