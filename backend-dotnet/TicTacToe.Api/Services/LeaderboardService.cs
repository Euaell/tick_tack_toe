using Microsoft.EntityFrameworkCore;
using TicTacToe.Api.Data;
using TicTacToe.Api.DTOs;

namespace TicTacToe.Api.Services;

public class LeaderboardService : ILeaderboardService
{
    private readonly ApplicationDbContext _context;

    public LeaderboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LeaderboardResponse> GetLeaderboardAsync(Guid? currentUserId = null, int top = 10)
    {
        var topPlayers = await _context.PlayerStatistics
            .Include(s => s.User)
            .Where(s => s.TotalGames > 0 && !s.User.IsAnonymous)
            .OrderByDescending(s => s.WinRate)
            .ThenByDescending(s => s.Wins)
            .ThenByDescending(s => s.TotalGames)
            .Take(top)
            .Select(s => new PlayerStatisticsDto(
                s.UserId,
                s.User.Username,
                s.Wins,
                s.Losses,
                s.Draws,
                s.TotalGames,
                s.WinRate
            ))
            .ToListAsync();

        PlayerStatisticsDto? currentPlayer = null;
        if (currentUserId != null)
        {
            var stats = await _context.PlayerStatistics
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == currentUserId);

            if (stats != null)
            {
                currentPlayer = new PlayerStatisticsDto(
                    stats.UserId,
                    stats.User.Username,
                    stats.Wins,
                    stats.Losses,
                    stats.Draws,
                    stats.TotalGames,
                    stats.WinRate
                );
            }
        }

        return new LeaderboardResponse(topPlayers, currentPlayer);
    }
}
