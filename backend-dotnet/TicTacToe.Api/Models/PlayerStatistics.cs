namespace TicTacToe.Api.Models;

public class PlayerStatistics
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int Draws { get; set; }
    public int TotalGames { get; set; }
    public double WinRate { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}
