using Microsoft.EntityFrameworkCore;
using TicTacToe.Api.Data;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public class ChatService : IChatService
{
    private readonly ApplicationDbContext _context;
    private readonly IRedisService _redis;

    public ChatService(ApplicationDbContext context, IRedisService redis)
    {
        _context = context;
        _redis = redis;
    }

    public async Task<ChatMessageDto> SendMessageAsync(Guid gameId, Guid senderId, string senderUsername, string message)
    {
        var chatMessage = new ChatMessage
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            SenderId = senderId,
            SenderUsername = senderUsername,
            Message = message,
            SentAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        // Also store in Redis for quick access
        var messageDto = new ChatMessageDto(
            chatMessage.Id,
            chatMessage.SenderId,
            chatMessage.SenderUsername,
            chatMessage.Message,
            chatMessage.SentAt
        );

        var serialized = System.Text.Json.JsonSerializer.Serialize(messageDto);
        await _redis.AddToListAsync($"chat:{gameId}", serialized, 100);

        return messageDto;
    }

    public async Task<List<ChatMessageDto>> GetMessagesAsync(Guid gameId)
    {
        // Try to get from Redis first
        var cachedMessages = await _redis.GetListAsync($"chat:{gameId}");
        if (cachedMessages.Any())
        {
            return cachedMessages
                .Select(m => System.Text.Json.JsonSerializer.Deserialize<ChatMessageDto>(m))
                .Where(m => m != null)
                .Cast<ChatMessageDto>()
                .ToList();
        }

        // Fallback to database
        var messages = await _context.ChatMessages
            .Where(m => m.GameId == gameId)
            .OrderBy(m => m.SentAt)
            .Take(100)
            .ToListAsync();

        return messages.Select(m => new ChatMessageDto(
            m.Id,
            m.SenderId,
            m.SenderUsername,
            m.Message,
            m.SentAt
        )).ToList();
    }
}
