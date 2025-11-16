using TicTacToe.Api.DTOs;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(string? username);
    Task<User?> GetUserByIdAsync(Guid userId);
    Task<User?> GetUserByTokenAsync(string token);
    string GenerateToken(Guid userId);
    Guid? ValidateToken(string token);
}
