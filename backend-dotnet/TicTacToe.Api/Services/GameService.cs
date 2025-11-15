using Microsoft.EntityFrameworkCore;
using TicTacToe.Api.Data;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public class GameService : IGameService
{
    private readonly ApplicationDbContext _context;
    private readonly IRedisService _redis;

    public GameService(ApplicationDbContext context, IRedisService redis)
    {
        _context = context;
        _redis = redis;
    }

    public async Task<Game> CreateGameAsync(Guid playerId, string connectionId)
    {
        var game = new Game
        {
            Id = Guid.NewGuid(),
            PlayerXId = playerId,
            PlayerXConnectionId = connectionId,
            Status = GameStatus.WaitingForPlayers,
            CurrentTurn = PlayerSymbol.X,
            CreatedAt = DateTime.UtcNow,
            LastMoveAt = DateTime.UtcNow
        };

        _context.Games.Add(game);
        await _context.SaveChangesAsync();

        // Store connection mapping in Redis
        await _redis.SetAsync($"connection:{connectionId}", game.Id, TimeSpan.FromHours(24));

        return game;
    }

    public async Task<(Game?, PlayerSymbol?)> JoinGameAsync(Guid gameId, Guid playerId, string connectionId)
    {
        var game = await _context.Games
            .Include(g => g.PlayerX)
            .Include(g => g.PlayerO)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return (null, null);

        PlayerSymbol assignedSymbol;

        // Check if player is already in the game
        if (game.PlayerXId == playerId)
        {
            game.PlayerXConnectionId = connectionId;
            assignedSymbol = PlayerSymbol.X;
        }
        else if (game.PlayerOId == playerId)
        {
            game.PlayerOConnectionId = connectionId;
            assignedSymbol = PlayerSymbol.O;
        }
        else if (game.PlayerOId == null)
        {
            // Assign as Player O
            game.PlayerOId = playerId;
            game.PlayerOConnectionId = connectionId;
            game.Status = GameStatus.InProgress;
            assignedSymbol = PlayerSymbol.O;
        }
        else
        {
            return (null, null); // Game is full
        }

        await _context.SaveChangesAsync();
        await _redis.SetAsync($"connection:{connectionId}", game.Id, TimeSpan.FromHours(24));

        return (game, assignedSymbol);
    }

    public async Task<Game?> GetGameAsync(Guid gameId)
    {
        return await _context.Games
            .Include(g => g.PlayerX)
            .Include(g => g.PlayerO)
            .Include(g => g.Moves)
            .FirstOrDefaultAsync(g => g.Id == gameId);
    }

    public async Task<GameStateDto?> GetGameStateAsync(Guid gameId)
    {
        var game = await GetGameAsync(gameId);
        if (game == null)
            return null;

        return MapToGameStateDto(game);
    }

    public async Task<MakeMoveResponse> MakeMoveAsync(Guid gameId, Guid playerId, int position)
    {
        var game = await GetGameAsync(gameId);
        if (game == null)
            return new MakeMoveResponse(false, "Game not found", null);

        if (game.Status != GameStatus.InProgress)
            return new MakeMoveResponse(false, "Game is not in progress", null);

        // Determine player symbol
        PlayerSymbol playerSymbol;
        if (game.PlayerXId == playerId)
            playerSymbol = PlayerSymbol.X;
        else if (game.PlayerOId == playerId)
            playerSymbol = PlayerSymbol.O;
        else
            return new MakeMoveResponse(false, "You are not a player in this game", null);

        // Check if it's the player's turn
        if (game.CurrentTurn != playerSymbol)
            return new MakeMoveResponse(false, "It's not your turn", null);

        // Validate position
        if (position < 0 || position > 8)
            return new MakeMoveResponse(false, "Invalid position", null);

        // Check if position is already taken
        if (game.Moves.Any(m => m.Position == position))
            return new MakeMoveResponse(false, "Position already taken", null);

        // Make the move
        var move = new GameMove
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            PlayerId = playerId,
            Symbol = playerSymbol,
            Position = position,
            MadeAt = DateTime.UtcNow
        };

        game.Moves.Add(move);
        game.LastMoveAt = DateTime.UtcNow;
        game.CurrentTurn = playerSymbol == PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;

        // Check for winner
        var winner = CheckWinner(game);
        if (winner != null)
        {
            game.Status = GameStatus.Completed;
            game.Winner = winner.Value.Winner;
            game.WinningLine = winner.Value.WinningLine;
            game.CompletedAt = DateTime.UtcNow;

            // Update statistics
            await UpdateStatisticsAsync(game);
        }
        else if (game.Moves.Count == 9)
        {
            // Draw
            game.Status = GameStatus.Draw;
            game.CompletedAt = DateTime.UtcNow;
            await UpdateStatisticsAsync(game);
        }

        await _context.SaveChangesAsync();

        return new MakeMoveResponse(true, null, MapToGameStateDto(game));
    }

    public async Task HandlePlayerDisconnectAsync(string connectionId)
    {
        var gameId = await _redis.GetAsync<Guid?>($"connection:{connectionId}");
        if (gameId == null)
            return;

        var game = await GetGameAsync(gameId.Value);
        if (game == null)
            return;

        if (game.PlayerXConnectionId == connectionId)
            game.PlayerXConnectionId = null;
        else if (game.PlayerOConnectionId == connectionId)
            game.PlayerOConnectionId = null;

        // If both players disconnected and game hasn't started, mark as abandoned
        if (game.PlayerXConnectionId == null && game.PlayerOConnectionId == null &&
            game.Status == GameStatus.WaitingForPlayers)
        {
            game.Status = GameStatus.Abandoned;
        }

        await _context.SaveChangesAsync();
        await _redis.DeleteAsync($"connection:{connectionId}");
    }

    public async Task HandlePlayerReconnectAsync(Guid gameId, Guid playerId, string newConnectionId)
    {
        var game = await GetGameAsync(gameId);
        if (game == null)
            return;

        if (game.PlayerXId == playerId)
            game.PlayerXConnectionId = newConnectionId;
        else if (game.PlayerOId == playerId)
            game.PlayerOConnectionId = newConnectionId;

        await _context.SaveChangesAsync();
        await _redis.SetAsync($"connection:{newConnectionId}", game.Id, TimeSpan.FromHours(24));
    }

    public async Task<bool> RequestRestartAsync(Guid gameId, Guid playerId)
    {
        await _redis.SetAsync($"restart_request:{gameId}:{playerId}", true, TimeSpan.FromMinutes(5));
        return true;
    }

    public async Task<bool> ConfirmRestartAsync(Guid gameId, Guid playerId)
    {
        var game = await GetGameAsync(gameId);
        if (game == null)
            return false;

        var opponentId = game.PlayerXId == playerId ? game.PlayerOId : game.PlayerXId;
        if (opponentId == null)
            return false;

        var requestExists = await _redis.GetAsync<bool?>($"restart_request:{gameId}:{opponentId}");
        if (requestExists != true)
            return false;

        // Clear the moves and reset the game
        _context.GameMoves.RemoveRange(game.Moves);
        game.Status = GameStatus.InProgress;
        game.CurrentTurn = PlayerSymbol.X;
        game.Winner = null;
        game.WinningLine = null;
        game.CompletedAt = null;
        game.LastMoveAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _redis.DeleteAsync($"restart_request:{gameId}:{opponentId}");

        return true;
    }

    private (PlayerSymbol Winner, int[] WinningLine)? CheckWinner(Game game)
    {
        var board = new string[9];
        foreach (var move in game.Moves)
        {
            board[move.Position] = move.Symbol.ToString();
        }

        int[][] winPatterns = new[]
        {
            new[] { 0, 1, 2 }, new[] { 3, 4, 5 }, new[] { 6, 7, 8 }, // Rows
            new[] { 0, 3, 6 }, new[] { 1, 4, 7 }, new[] { 2, 5, 8 }, // Columns
            new[] { 0, 4, 8 }, new[] { 2, 4, 6 }  // Diagonals
        };

        foreach (var pattern in winPatterns)
        {
            if (board[pattern[0]] != null &&
                board[pattern[0]] == board[pattern[1]] &&
                board[pattern[1]] == board[pattern[2]])
            {
                var winner = Enum.Parse<PlayerSymbol>(board[pattern[0]]);
                return (winner, pattern);
            }
        }

        return null;
    }

    private async Task UpdateStatisticsAsync(Game game)
    {
        if (game.PlayerXId == null || game.PlayerOId == null)
            return;

        var playerXStats = await _context.PlayerStatistics
            .FirstOrDefaultAsync(s => s.UserId == game.PlayerXId);
        var playerOStats = await _context.PlayerStatistics
            .FirstOrDefaultAsync(s => s.UserId == game.PlayerOId);

        if (playerXStats == null || playerOStats == null)
            return;

        if (game.Status == GameStatus.Completed)
        {
            if (game.Winner == PlayerSymbol.X)
            {
                playerXStats.Wins++;
                playerOStats.Losses++;
            }
            else
            {
                playerOStats.Wins++;
                playerXStats.Losses++;
            }
        }
        else if (game.Status == GameStatus.Draw)
        {
            playerXStats.Draws++;
            playerOStats.Draws++;
        }

        playerXStats.TotalGames++;
        playerOStats.TotalGames++;

        playerXStats.WinRate = playerXStats.TotalGames > 0
            ? (double)playerXStats.Wins / playerXStats.TotalGames
            : 0;
        playerOStats.WinRate = playerOStats.TotalGames > 0
            ? (double)playerOStats.Wins / playerOStats.TotalGames
            : 0;

        playerXStats.UpdatedAt = DateTime.UtcNow;
        playerOStats.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private GameStateDto MapToGameStateDto(Game game)
    {
        var board = new string[9];
        foreach (var move in game.Moves)
        {
            board[move.Position] = move.Symbol.ToString();
        }

        return new GameStateDto(
            game.Id,
            game.PlayerXId,
            game.PlayerOId,
            game.PlayerX?.Username,
            game.PlayerO?.Username,
            game.PlayerXConnectionId != null,
            game.PlayerOConnectionId != null,
            game.Status,
            game.CurrentTurn,
            game.Winner,
            game.WinningLine,
            board,
            game.CreatedAt,
            game.CompletedAt
        );
    }
}
