using UserService.Helpers;
using Xunit;

namespace UserService.Tests;

public class PasswordHasherTests
{
    [Fact]
    public void Hash_ProducesDifferentHashAndSalt_ForSamePassword()
    {
        var (hash1, salt1) = PasswordHasher.Hash("secret123");
        var (hash2, salt2) = PasswordHasher.Hash("secret123");

        // Each call must use a fresh random salt, so hashes should differ
        // even for the same plaintext password.
        Assert.NotEqual(hash1, hash2);
        Assert.NotEqual(salt1, salt2);
    }

    [Fact]
    public void Verify_ReturnsTrue_ForCorrectPassword()
    {
        var (hash, salt) = PasswordHasher.Hash("correct-horse-battery-staple");

        var result = PasswordHasher.Verify("correct-horse-battery-staple", hash, salt);

        Assert.True(result);
    }

    [Fact]
    public void Verify_ReturnsFalse_ForIncorrectPassword()
    {
        var (hash, salt) = PasswordHasher.Hash("correct-horse-battery-staple");

        var result = PasswordHasher.Verify("wrong-password", hash, salt);

        Assert.False(result);
    }

    [Fact]
    public void Verify_ReturnsFalse_WhenSaltDoesNotMatch()
    {
        var (hash, _) = PasswordHasher.Hash("secret123");
        var (_, otherSalt) = PasswordHasher.Hash("different-password");

        var result = PasswordHasher.Verify("secret123", hash, otherSalt);

        Assert.False(result);
    }
}
