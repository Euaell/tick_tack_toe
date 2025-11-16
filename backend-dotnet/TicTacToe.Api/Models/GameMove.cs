namespace TicTacToe.Api.Models;

public class GameMove
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid PlayerId { get; set; }
    public PlayerSymbol Symbol { get; set; }
    public int Position { get; set; }
    public DateTime MadeAt { get; set; }

    // Navigation property
    public Game Game { get; set; } = null!;
}
