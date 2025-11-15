namespace TicTacToe.Api.DTOs;

public record PlayerStatisticsDto(
    Guid UserId,
    string Username,
    int Wins,
    int Losses,
    int Draws,
    int TotalGames,
    double WinRate
);

public record LeaderboardResponse(
    List<PlayerStatisticsDto> TopPlayers,
    PlayerStatisticsDto? CurrentPlayer
);
