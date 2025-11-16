using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request.Username);
        return Ok(response);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser([FromHeader(Name = "Authorization")] string? authorization)
    {
        if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer "))
            return Unauthorized();

        var token = authorization.Substring("Bearer ".Length).Trim();
        var user = await _authService.GetUserByTokenAsync(token);

        if (user == null)
            return Unauthorized();

        var userDto = new UserDto(
            user.Id,
            user.Username,
            user.IsAnonymous,
            user.Statistics != null
                ? new PlayerStatisticsDto(
                    user.Statistics.UserId,
                    user.Username,
                    user.Statistics.Wins,
                    user.Statistics.Losses,
                    user.Statistics.Draws,
                    user.Statistics.TotalGames,
                    user.Statistics.WinRate)
                : null
        );

        return Ok(userDto);
    }
}
