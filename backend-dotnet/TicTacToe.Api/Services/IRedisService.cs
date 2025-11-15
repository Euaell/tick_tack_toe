namespace TicTacToe.Api.Services;

public interface IRedisService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task<bool> DeleteAsync(string key);
    Task<List<string>> GetListAsync(string key);
    Task AddToListAsync(string key, string value, int maxLength = 100);
}
