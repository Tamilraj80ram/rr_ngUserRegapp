FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY UserService.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Render sets $PORT at runtime; Program.cs reads it and binds Kestrel to it.
ENTRYPOINT ["dotnet", "UserService.dll"]
