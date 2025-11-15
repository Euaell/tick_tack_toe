namespace TicTacToe.Api.DTOs;

public record LoginRequest(string? Username);

public record LoginResponse(
    Guid UserId,
    string Username,
    bool IsAnonymous,
    string Token
);

public record UserDto(
    Guid Id,
    string Username,
    bool IsAnonymous,
    PlayerStatisticsDto? Statistics
);
