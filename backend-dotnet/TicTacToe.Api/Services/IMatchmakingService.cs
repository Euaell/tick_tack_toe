using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public interface IMatchmakingService
{
    Task<Guid?> JoinQueueAsync(Guid userId, string connectionId);
    Task LeaveQueueAsync(Guid userId);
    Task<List<Guid>> GetWaitingPlayersAsync();
}
