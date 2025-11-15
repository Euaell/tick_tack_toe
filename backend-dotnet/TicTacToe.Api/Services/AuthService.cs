using Microsoft.EntityFrameworkCore;
using TicTacToe.Api.Data;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IRedisService _redis;

    public AuthService(ApplicationDbContext context, IRedisService redis)
    {
        _context = context;
        _redis = redis;
    }

    public async Task<LoginResponse> LoginAsync(string? username)
    {
        User user;
        bool isAnonymous = string.IsNullOrWhiteSpace(username);

        if (isAnonymous)
        {
            // Create anonymous user
            user = new User
            {
                Id = Guid.NewGuid(),
                Username = $"Guest_{Guid.NewGuid().ToString()[..8]}",
                IsAnonymous = true,
                CreatedAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            };
        }
        else
        {
            // Check if user exists
            user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username && !u.IsAnonymous);

            if (user == null)
            {
                // Create new user
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = username!,
                    IsAnonymous = false,
                    CreatedAt = DateTime.UtcNow,
                    LastSeenAt = DateTime.UtcNow
                };
            }
            else
            {
                user.LastSeenAt = DateTime.UtcNow;
            }
        }

        // Ensure user has statistics
        if (user.Statistics == null)
        {
            var stats = new PlayerStatistics
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Wins = 0,
                Losses = 0,
                Draws = 0,
                TotalGames = 0,
                WinRate = 0,
                UpdatedAt = DateTime.UtcNow
            };
            user.Statistics = stats;
        }

        if (_context.Entry(user).State == EntityState.Detached)
        {
            _context.Users.Add(user);
        }
        await _context.SaveChangesAsync();

        var token = GenerateToken(user.Id);
        await _redis.SetAsync($"token:{token}", user.Id, TimeSpan.FromDays(30));

        return new LoginResponse(user.Id, user.Username, user.IsAnonymous, token);
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _context.Users
            .Include(u => u.Statistics)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<User?> GetUserByTokenAsync(string token)
    {
        var userId = await _redis.GetAsync<Guid?>($"token:{token}");
        if (userId == null)
            return null;

        return await GetUserByIdAsync(userId.Value);
    }

    public string GenerateToken(Guid userId)
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray() + userId.ToByteArray());
    }

    public Guid? ValidateToken(string token)
    {
        try
        {
            var userId = _redis.GetAsync<Guid?>($"token:{token}").Result;
            return userId;
        }
        catch
        {
            return null;
        }
    }
}
