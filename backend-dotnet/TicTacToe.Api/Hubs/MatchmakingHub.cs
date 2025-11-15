using Microsoft.AspNetCore.SignalR;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Hubs;

public class MatchmakingHub : Hub
{
    private readonly IMatchmakingService _matchmakingService;
    private readonly IAuthService _authService;
    private readonly IGameService _gameService;

    public MatchmakingHub(IMatchmakingService matchmakingService, IAuthService authService, IGameService gameService)
    {
        _matchmakingService = matchmakingService;
        _authService = authService;
        _gameService = gameService;
    }

    public async Task JoinQueue(string token)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
        {
            await Clients.Caller.SendAsync("Error", "Invalid token");
            return;
        }

        var gameId = await _matchmakingService.JoinQueueAsync(user.Id, Context.ConnectionId);

        if (gameId != null)
        {
            // Match found!
            var gameState = await _gameService.GetGameStateAsync(gameId.Value);
            await Clients.Caller.SendAsync("MatchFound", gameState);
        }
        else
        {
            // Added to queue
            await Clients.Caller.SendAsync("QueueJoined");
        }
    }

    public async Task LeaveQueue(string token)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return;

        await _matchmakingService.LeaveQueueAsync(user.Id);
        await Clients.Caller.SendAsync("QueueLeft");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // The connection ID is used in matchmaking, so no additional cleanup needed
        await base.OnDisconnectedAsync(exception);
    }
}
