using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;
    private readonly IAuthService _authService;

    public LeaderboardController(ILeaderboardService leaderboardService, IAuthService authService)
    {
        _leaderboardService = leaderboardService;
        _authService = authService;
    }

    [HttpGet]
    public async Task<ActionResult<LeaderboardResponse>> GetLeaderboard(
        [FromHeader(Name = "Authorization")] string? authorization,
        [FromQuery] int top = 10)
    {
        Guid? currentUserId = null;

        if (!string.IsNullOrWhiteSpace(authorization) && authorization.StartsWith("Bearer "))
        {
            var token = authorization.Substring("Bearer ".Length).Trim();
            var user = await _authService.GetUserByTokenAsync(token);
            currentUserId = user?.Id;
        }

        var leaderboard = await _leaderboardService.GetLeaderboardAsync(currentUserId, top);
        return Ok(leaderboard);
    }
}
