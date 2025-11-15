using System.ComponentModel.DataAnnotations;

namespace TicTacToe.Api.Models;

public class Game
{
    public Guid Id { get; set; }
    public Guid? PlayerXId { get; set; }
    public Guid? PlayerOId { get; set; }
    public string? PlayerXConnectionId { get; set; }
    public string? PlayerOConnectionId { get; set; }
    public GameStatus Status { get; set; }
    public PlayerSymbol CurrentTurn { get; set; }
    public PlayerSymbol? Winner { get; set; }
    public int[]? WinningLine { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime LastMoveAt { get; set; }

    // Concurrency control
    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navigation properties
    public User? PlayerX { get; set; }
    public User? PlayerO { get; set; }
    public ICollection<GameMove> Moves { get; set; } = new List<GameMove>();
    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}

public enum GameStatus
{
    WaitingForPlayers,
    InProgress,
    Completed,
    Draw,
    Abandoned
}

public enum PlayerSymbol
{
    X,
    O
}
