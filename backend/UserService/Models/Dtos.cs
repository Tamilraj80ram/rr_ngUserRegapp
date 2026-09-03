using System.ComponentModel.DataAnnotations;

namespace UserService.Models;

public record RegisterRequest(
    [property: Required, StringLength(100, MinimumLength = 2)] string FullName,
    [property: Required, EmailAddress] string Email,
    [property: Required, MinLength(6)] string Password
);

public record LoginRequest(
    [property: Required, EmailAddress] string Email,
    [property: Required] string Password
);

public record UserResponse(Guid Id, string FullName, string Email, DateTime CreatedAtUtc);

public record ApiError(string Message);
