using TicTacToe.Api.DTOs;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public interface IGameService
{
    Task<Game> CreateGameAsync(Guid playerId, string connectionId);
    Task<(Game?, PlayerSymbol?)> JoinGameAsync(Guid gameId, Guid playerId, string connectionId);
    Task<Game?> GetGameAsync(Guid gameId);
    Task<GameStateDto?> GetGameStateAsync(Guid gameId);
    Task<MakeMoveResponse> MakeMoveAsync(Guid gameId, Guid playerId, int position);
    Task HandlePlayerDisconnectAsync(string connectionId);
    Task HandlePlayerReconnectAsync(Guid gameId, Guid playerId, string newConnectionId);
    Task<bool> RequestRestartAsync(Guid gameId, Guid playerId);
    Task<bool> ConfirmRestartAsync(Guid gameId, Guid playerId);
}
