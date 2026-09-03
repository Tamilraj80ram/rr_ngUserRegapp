using UserService.Models;

namespace UserService.Services;

public interface IUserStore
{
    bool EmailExists(string email);
    User Add(User user);
    User? FindByEmail(string email);
    IEnumerable<User> GetAll();
}

/// <summary>
/// Simple thread-safe in-memory store so the microservice runs with zero
/// external dependencies (no DB server / NuGet package required).
/// Swap this out for an EF Core + SQL/Postgres implementation for production use.
/// </summary>
public class InMemoryUserStore : IUserStore
{
    private readonly Dictionary<string, User> _usersByEmail = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _lock = new();

    public bool EmailExists(string email)
    {
        lock (_lock)
        {
            return _usersByEmail.ContainsKey(email);
        }
    }

    public User Add(User user)
    {
        lock (_lock)
        {
            _usersByEmail[user.Email] = user;
            return user;
        }
    }

    public User? FindByEmail(string email)
    {
        lock (_lock)
        {
            return _usersByEmail.GetValueOrDefault(email);
        }
    }

    public IEnumerable<User> GetAll()
    {
        lock (_lock)
        {
            return _usersByEmail.Values.ToList();
        }
    }
}
