using StackExchange.Redis;
using System.Text.Json;

namespace TicTacToe.Api.Services;

public class RedisService : IRedisService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _db;

    public RedisService(IConnectionMultiplexer redis)
    {
        _redis = redis;
        _db = redis.GetDatabase();
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var value = await _db.StringGetAsync(key);
        if (value.IsNullOrEmpty)
            return default;

        return JsonSerializer.Deserialize<T>(value!);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var serialized = JsonSerializer.Serialize(value);
        await _db.StringSetAsync(key, serialized, expiry);
    }

    public async Task<bool> DeleteAsync(string key)
    {
        return await _db.KeyDeleteAsync(key);
    }

    public async Task<List<string>> GetListAsync(string key)
    {
        var values = await _db.ListRangeAsync(key);
        return values.Select(v => v.ToString()).ToList();
    }

    public async Task AddToListAsync(string key, string value, int maxLength = 100)
    {
        await _db.ListRightPushAsync(key, value);
        await _db.ListTrimAsync(key, -maxLength, -1);
    }
}
