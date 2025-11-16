namespace TicTacToe.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastSeenAt { get; set; }

    // Navigation properties
    public PlayerStatistics? Statistics { get; set; }
    public ICollection<Game> GamesAsPlayerX { get; set; } = new List<Game>();
    public ICollection<Game> GamesAsPlayerO { get; set; } = new List<Game>();
}
