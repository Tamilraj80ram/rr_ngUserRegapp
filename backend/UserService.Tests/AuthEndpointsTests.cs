using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using UserService.Models;
using Xunit;

namespace UserService.Tests;

/// <summary>
/// Spins up the real ASP.NET Core pipeline in-memory (via WebApplicationFactory)
/// and hits the actual HTTP endpoints. A fresh factory/client is created for
/// each test so the in-memory user store doesn't leak state between tests.
/// </summary>
public class AuthEndpointsTests : IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthEndpointsTests()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    [Fact]
    public async Task Register_WithValidData_Returns201AndUser()
    {
        var request = new RegisterRequest("Jane Doe", "jane@example.com", "secret123");

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(user);
        Assert.Equal("jane@example.com", user!.Email);
        Assert.Equal("Jane Doe", user.FullName);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns409()
    {
        var request = new RegisterRequest("Jane Doe", "dupe@example.com", "secret123");
        await _client.PostAsJsonAsync("/api/auth/register", request);

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Theory]
    [InlineData("", "valid@example.com", "secret123")]      // missing full name
    [InlineData("Jane Doe", "not-an-email", "secret123")]   // invalid email
    [InlineData("Jane Doe", "valid2@example.com", "123")]   // password too short
    public async Task Register_WithInvalidData_Returns400(string fullName, string email, string password)
    {
        var request = new RegisterRequest(fullName, email, password);

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithCorrectCredentials_Returns200AndUser()
    {
        var register = new RegisterRequest("Jane Doe", "login-ok@example.com", "secret123");
        await _client.PostAsJsonAsync("/api/auth/register", register);

        var login = new LoginRequest("login-ok@example.com", "secret123");
        var response = await _client.PostAsJsonAsync("/api/auth/login", login);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>();
        Assert.NotNull(user);
        Assert.Equal("login-ok@example.com", user!.Email);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var register = new RegisterRequest("Jane Doe", "login-bad@example.com", "secret123");
        await _client.PostAsJsonAsync("/api/auth/register", register);

        var login = new LoginRequest("login-bad@example.com", "wrong-password");
        var response = await _client.PostAsJsonAsync("/api/auth/login", login);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_Returns401()
    {
        var login = new LoginRequest("nobody@example.com", "whatever123");

        var response = await _client.PostAsJsonAsync("/api/auth/login", login);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Health_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
