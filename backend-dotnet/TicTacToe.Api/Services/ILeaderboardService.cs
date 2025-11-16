using TicTacToe.Api.DTOs;

namespace TicTacToe.Api.Services;

public interface ILeaderboardService
{
    Task<LeaderboardResponse> GetLeaderboardAsync(Guid? currentUserId = null, int top = 10);
}
