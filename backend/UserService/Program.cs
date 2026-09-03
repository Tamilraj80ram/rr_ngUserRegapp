using System.ComponentModel.DataAnnotations;
using UserService.Helpers;
using UserService.Models;
using UserService.Services;

var builder = WebApplication.CreateBuilder(args);

// ---- Services ----------------------------------------------------------

builder.Services.AddSingleton<IUserStore, InMemoryUserStore>();

const string CorsPolicy = "AllowAngularApp";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy
            // Add your deployed frontend origin here too, e.g. "https://yourname.github.io"
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors(CorsPolicy);

// ---- Helpers -------------------------------------------------------------

static UserResponse ToResponse(User u) => new(u.Id, u.FullName, u.Email, u.CreatedAtUtc);

static bool TryValidate(object model, out IResult? problem)
{
    var context = new ValidationContext(model);
    var results = new List<ValidationResult>();
    bool isValid = Validator.TryValidateObject(model, context, results, validateAllProperties: true);

    if (isValid)
    {
        problem = null;
        return true;
    }

    var errors = results
        .SelectMany(r => r.MemberNames.DefaultIfEmpty(""), (r, member) => (member, r.ErrorMessage))
        .GroupBy(x => x.member)
        .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage ?? "Invalid value").ToArray());

    problem = Results.ValidationProblem(errors);
    return false;
}

// ---- Endpoints -------------------------------------------------------------

app.MapGet("/", () => Results.Ok(new { service = "UserService", status = "running" }));

app.MapGet("/health", () => Results.Ok(new { status = "healthy", utc = DateTime.UtcNow }));

var auth = app.MapGroup("/api/auth");

auth.MapPost("/register", (RegisterRequest request, IUserStore store) =>
{
    if (!TryValidate(request, out var problem)) return problem!;

    if (store.EmailExists(request.Email))
    {
        return Results.Conflict(new ApiError("An account with this email already exists."));
    }

    var (hash, salt) = PasswordHasher.Hash(request.Password);

    var user = new User
    {
        FullName = request.FullName.Trim(),
        Email = request.Email.Trim().ToLowerInvariant(),
        PasswordHash = hash,
        PasswordSalt = salt
    };

    store.Add(user);

    return Results.Created($"/api/users/{user.Id}", ToResponse(user));
});

auth.MapPost("/login", (LoginRequest request, IUserStore store) =>
{
    if (!TryValidate(request, out var problem)) return problem!;

    var user = store.FindByEmail(request.Email.Trim());
    if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
    {
        return Results.Json(new ApiError("Invalid email or password."), statusCode: StatusCodes.Status401Unauthorized);
    }

    return Results.Ok(ToResponse(user));
});

var users = app.MapGroup("/api/users");

// Demo/admin endpoint to see registered users (no passwords ever exposed).
users.MapGet("/", (IUserStore store) => Results.Ok(store.GetAll().Select(ToResponse)));

users.MapGet("/{id:guid}", (Guid id, IUserStore store) =>
{
    var user = store.GetAll().FirstOrDefault(u => u.Id == id);
    return user is null ? Results.NotFound() : Results.Ok(ToResponse(user));
});

app.Run();
