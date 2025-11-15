using System.Text.Json;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public class MatchmakingService : IMatchmakingService
{
    private readonly IRedisService _redis;
    private readonly IGameService _gameService;
    private const string QueueKey = "matchmaking:queue";

    public MatchmakingService(IRedisService redis, IGameService gameService)
    {
        _redis = redis;
        _gameService = gameService;
    }

    public async Task<Guid?> JoinQueueAsync(Guid userId, string connectionId)
    {
        // Get current queue
        var queueJson = await _redis.GetListAsync(QueueKey);
        var queue = queueJson
            .Select(j => JsonSerializer.Deserialize<QueuePlayer>(j))
            .Where(p => p != null)
            .Cast<QueuePlayer>()
            .ToList();

        // Check if there's someone waiting
        var opponent = queue.FirstOrDefault(p => p.UserId != userId);
        if (opponent != null)
        {
            // Match found! Create a game
            var game = await _gameService.CreateGameAsync(opponent.UserId, opponent.ConnectionId);
            await _gameService.JoinGameAsync(game.Id, userId, connectionId);

            // Remove opponent from queue
            await RemoveFromQueueAsync(opponent.UserId);

            return game.Id;
        }

        // Add to queue
        var player = new QueuePlayer(userId, connectionId, DateTime.UtcNow);
        var serialized = JsonSerializer.Serialize(player);
        await _redis.AddToListAsync(QueueKey, serialized, 100);

        return null;
    }

    public async Task LeaveQueueAsync(Guid userId)
    {
        await RemoveFromQueueAsync(userId);
    }

    public async Task<List<Guid>> GetWaitingPlayersAsync()
    {
        var queueJson = await _redis.GetListAsync(QueueKey);
        return queueJson
            .Select(j => JsonSerializer.Deserialize<QueuePlayer>(j))
            .Where(p => p != null)
            .Cast<QueuePlayer>()
            .Select(p => p.UserId)
            .ToList();
    }

    private async Task RemoveFromQueueAsync(Guid userId)
    {
        var queueJson = await _redis.GetListAsync(QueueKey);
        var queue = queueJson
            .Select(j => JsonSerializer.Deserialize<QueuePlayer>(j))
            .Where(p => p != null && p.UserId != userId)
            .Cast<QueuePlayer>()
            .ToList();

        // Clear and rebuild queue without the user
        await _redis.DeleteAsync(QueueKey);
        foreach (var player in queue)
        {
            var serialized = JsonSerializer.Serialize(player);
            await _redis.AddToListAsync(QueueKey, serialized, 100);
        }
    }

    private record QueuePlayer(Guid UserId, string ConnectionId, DateTime JoinedAt);
}
