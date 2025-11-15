using Microsoft.AspNetCore.SignalR;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Hubs;

public class GameHub : Hub
{
    private readonly IGameService _gameService;
    private readonly IAuthService _authService;

    public GameHub(IGameService gameService, IAuthService authService)
    {
        _gameService = gameService;
        _authService = authService;
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await _gameService.HandlePlayerDisconnectAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task<JoinGameResponse> CreateGame(string token)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return new JoinGameResponse(false, "Invalid token", null, null);

        var game = await _gameService.CreateGameAsync(user.Id, Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, game.Id.ToString());

        var gameState = await _gameService.GetGameStateAsync(game.Id);
        return new JoinGameResponse(true, null, gameState, Models.PlayerSymbol.X);
    }

    public async Task<JoinGameResponse> JoinGame(string token, Guid gameId)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return new JoinGameResponse(false, "Invalid token", null, null);

        var (game, symbol) = await _gameService.JoinGameAsync(gameId, user.Id, Context.ConnectionId);
        if (game == null)
            return new JoinGameResponse(false, "Game not found or is full", null, null);

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());

        var gameState = await _gameService.GetGameStateAsync(gameId);

        // Notify other players
        await Clients.Group(gameId.ToString()).SendAsync("PlayerJoined", gameState);

        return new JoinGameResponse(true, null, gameState, symbol);
    }

    public async Task<MakeMoveResponse> MakeMove(string token, Guid gameId, int position)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return new MakeMoveResponse(false, "Invalid token", null);

        var result = await _gameService.MakeMoveAsync(gameId, user.Id, position);

        if (result.Success)
        {
            // Broadcast to all players in the game
            await Clients.Group(gameId.ToString()).SendAsync("GameUpdate", result.GameState);
        }

        return result;
    }

    public async Task<bool> RequestRestart(string token, Guid gameId)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return false;

        var result = await _gameService.RequestRestartAsync(gameId, user.Id);
        if (result)
        {
            // Notify opponent
            await Clients.Group(gameId.ToString()).SendAsync("RestartRequested", user.Username);
        }

        return result;
    }

    public async Task<bool> ConfirmRestart(string token, Guid gameId, bool accepted)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return false;

        if (!accepted)
        {
            await Clients.Group(gameId.ToString()).SendAsync("RestartDeclined");
            return false;
        }

        var result = await _gameService.ConfirmRestartAsync(gameId, user.Id);
        if (result)
        {
            var gameState = await _gameService.GetGameStateAsync(gameId);
            await Clients.Group(gameId.ToString()).SendAsync("GameRestarted", gameState);
        }

        return result;
    }

    public async Task Reconnect(string token, Guid gameId)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return;

        await _gameService.HandlePlayerReconnectAsync(gameId, user.Id, Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());

        var gameState = await _gameService.GetGameStateAsync(gameId);
        await Clients.Caller.SendAsync("GameUpdate", gameState);
        await Clients.Group(gameId.ToString()).SendAsync("PlayerReconnected", user.Username);
    }
}
