using Microsoft.AspNetCore.SignalR;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Hubs;

public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly IAuthService _authService;

    public ChatHub(IChatService chatService, IAuthService authService)
    {
        _chatService = chatService;
        _authService = authService;
    }

    public async Task JoinChat(Guid gameId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat:{gameId}");

        // Send chat history
        var messages = await _chatService.GetMessagesAsync(gameId);
        await Clients.Caller.SendAsync("ChatHistory", messages);
    }

    public async Task SendMessage(string token, Guid gameId, string message)
    {
        var user = await _authService.GetUserByTokenAsync(token);
        if (user == null)
            return;

        var chatMessage = await _chatService.SendMessageAsync(gameId, user.Id, user.Username, message);

        // Broadcast to all players in the chat
        await Clients.Group($"chat:{gameId}").SendAsync("ReceiveMessage", chatMessage);
    }

    public async Task LeaveChat(Guid gameId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat:{gameId}");
    }
}
