using UserService.Models;
using UserService.Services;
using Xunit;

namespace UserService.Tests;

public class InMemoryUserStoreTests
{
    private static User MakeUser(string email = "jane@example.com") => new()
    {
        FullName = "Jane Doe",
        Email = email,
        PasswordHash = "hash",
        PasswordSalt = "salt"
    };

    [Fact]
    public void EmailExists_ReturnsFalse_WhenStoreIsEmpty()
    {
        var store = new InMemoryUserStore();

        Assert.False(store.EmailExists("jane@example.com"));
    }

    [Fact]
    public void Add_ThenEmailExists_ReturnsTrue()
    {
        var store = new InMemoryUserStore();
        store.Add(MakeUser());

        Assert.True(store.EmailExists("jane@example.com"));
    }

    [Fact]
    public void EmailExists_IsCaseInsensitive()
    {
        var store = new InMemoryUserStore();
        store.Add(MakeUser("Jane@Example.com"));

        Assert.True(store.EmailExists("jane@example.com"));
        Assert.True(store.EmailExists("JANE@EXAMPLE.COM"));
    }

    [Fact]
    public void FindByEmail_ReturnsNull_WhenUserDoesNotExist()
    {
        var store = new InMemoryUserStore();

        Assert.Null(store.FindByEmail("missing@example.com"));
    }

    [Fact]
    public void FindByEmail_ReturnsMatchingUser()
    {
        var store = new InMemoryUserStore();
        var user = MakeUser();
        store.Add(user);

        var found = store.FindByEmail("jane@example.com");

        Assert.NotNull(found);
        Assert.Equal(user.Id, found!.Id);
    }

    [Fact]
    public void GetAll_ReturnsAllAddedUsers()
    {
        var store = new InMemoryUserStore();
        store.Add(MakeUser("a@example.com"));
        store.Add(MakeUser("b@example.com"));

        var all = store.GetAll().ToList();

        Assert.Equal(2, all.Count);
    }

    [Fact]
    public void Add_WithSameEmail_OverwritesExistingUser()
    {
        var store = new InMemoryUserStore();
        store.Add(MakeUser());
        var replacement = MakeUser();
        replacement.FullName = "Jane Updated";
        store.Add(replacement);

        var all = store.GetAll().ToList();

        Assert.Single(all);
        Assert.Equal("Jane Updated", all[0].FullName);
    }
}
