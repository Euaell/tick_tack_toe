using TicTacToe.Api.DTOs;

namespace TicTacToe.Api.Services;

public interface IChatService
{
    Task<ChatMessageDto> SendMessageAsync(Guid gameId, Guid senderId, string senderUsername, string message);
    Task<List<ChatMessageDto>> GetMessagesAsync(Guid gameId);
}
