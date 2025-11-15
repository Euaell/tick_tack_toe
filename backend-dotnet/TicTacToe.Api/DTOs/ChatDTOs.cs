namespace TicTacToe.Api.DTOs;

public record ChatMessageDto(
    Guid Id,
    Guid SenderId,
    string SenderUsername,
    string Message,
    DateTime SentAt
);

public record SendMessageRequest(string Message);
