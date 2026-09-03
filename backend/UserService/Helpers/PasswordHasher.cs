using System.Security.Cryptography;

namespace UserService.Helpers;

/// <summary>
/// Salted PBKDF2 password hashing using only built-in .NET APIs
/// (no external NuGet dependency needed).
/// </summary>
public static class PasswordHasher
{
    private const int SaltSize = 16;      // 128 bit
    private const int KeySize = 32;       // 256 bit
    private const int Iterations = 100_000;
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    public static (string Hash, string Salt) Hash(string password)
    {
        byte[] saltBytes = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] hashBytes = Rfc2898DeriveBytes.Pbkdf2(
            password, saltBytes, Iterations, Algorithm, KeySize);

        return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes));
    }

    public static bool Verify(string password, string storedHash, string storedSalt)
    {
        byte[] saltBytes = Convert.FromBase64String(storedSalt);
        byte[] expectedHash = Convert.FromBase64String(storedHash);

        byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(
            password, saltBytes, Iterations, Algorithm, KeySize);

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}
