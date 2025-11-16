namespace TicTacToe.Api.Models;

public class ChatMessage
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderUsername { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }

    // Navigation property
    public Game Game { get; set; } = null!;
}
