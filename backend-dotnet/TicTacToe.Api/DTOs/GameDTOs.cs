using TicTacToe.Api.Models;

namespace TicTacToe.Api.DTOs;

public record GameStateDto(
    Guid Id,
    Guid? PlayerXId,
    Guid? PlayerOId,
    string? PlayerXUsername,
    string? PlayerOUsername,
    bool PlayerXConnected,
    bool PlayerOConnected,
    GameStatus Status,
    PlayerSymbol CurrentTurn,
    PlayerSymbol? Winner,
    int[]? WinningLine,
    string[] Board,
    DateTime CreatedAt,
    DateTime? CompletedAt
);

public record MakeMoveRequest(int Position);

public record MakeMoveResponse(
    bool Success,
    string? Error,
    GameStateDto? GameState
);

public record JoinGameRequest(Guid GameId);

public record JoinGameResponse(
    bool Success,
    string? Error,
    GameStateDto? GameState,
    PlayerSymbol? AssignedSymbol
);
