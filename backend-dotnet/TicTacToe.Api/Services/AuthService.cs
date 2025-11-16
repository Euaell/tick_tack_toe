using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using TicTacToe.Api.Data;
using TicTacToe.Api.DTOs;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthService> _logger;
    private static readonly Regex UsernameRegex = new Regex("^[a-zA-Z0-9_-]{3,20}$", RegexOptions.Compiled);

    public AuthService(ApplicationDbContext context, IJwtTokenService jwtTokenService, ILogger<AuthService> logger)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(string? username)
    {
        User? user;
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

            _logger.LogInformation("Creating anonymous user {Username}", user.Username);
        }
        else
        {
            // Validate username format
            if (!UsernameRegex.IsMatch(username!))
            {
                throw new ArgumentException("Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores");
            }

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

                _logger.LogInformation("Creating new user {Username}", username);
            }
            else
            {
                user.LastSeenAt = DateTime.UtcNow;
                _logger.LogInformation("User {Username} logged in", username);
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

        var token = _jwtTokenService.GenerateToken(user.Id, user.Username, user.IsAnonymous);

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
        var userId = _jwtTokenService.GetUserIdFromToken(token);
        if (userId == null)
        {
            _logger.LogWarning("Invalid token provided");
            return null;
        }

        return await GetUserByIdAsync(userId.Value);
    }

    public string GenerateToken(Guid userId)
    {
        // This method is deprecated but kept for interface compatibility
        throw new NotImplementedException("Use IJwtTokenService.GenerateToken instead");
    }

    public async Task<Guid?> ValidateTokenAsync(string token)
    {
        return await Task.FromResult(_jwtTokenService.GetUserIdFromToken(token));
    }

    public Guid? ValidateToken(string token)
    {
        // This method is deprecated but kept for interface compatibility
        return _jwtTokenService.GetUserIdFromToken(token);
    }
}
