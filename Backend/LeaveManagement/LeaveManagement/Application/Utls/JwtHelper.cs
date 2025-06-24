using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LeaveManagement.Application.Utls;
public class JwtHelper
{

    private readonly IConfiguration _configuration;

    public JwtHelper(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateJwtToken(int employeeId, string role)
    {
        var secretKey = _configuration["JwtSettings:SecretKey"];
        if (string.IsNullOrEmpty(secretKey))
        {
            throw new ArgumentNullException(nameof(secretKey), "Secret key cannot be null or empty.");
        }

        var key = Encoding.UTF8.GetBytes(secretKey);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
        new Claim("employeeId", employeeId.ToString()),
        new Claim("role", role)
    }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }


    public ClaimsPrincipal? ValidateJwtToken(string token)
    {
        var secretKey = _configuration["JwtSettings:SecretKey"];

        // Check if the secret key is null or empty
        if (string.IsNullOrEmpty(secretKey))
        {
            // Handle the case where the secret key is not configured
            // You might want to log an error or throw an exception
            Console.WriteLine("Warning: JWT Secret Key is not configured.");
            return null;
        }

        var key = Encoding.UTF8.GetBytes(secretKey);
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
            return principal;
        }
        catch (SecurityTokenException ex)
        {
            // Catch specific token validation exceptions for better error handling
            Console.WriteLine($"Token validation failed: {ex.Message}");
            return null;
        }
        catch (Exception ex)
        {
            // Catch any other exceptions during the process
            Console.WriteLine($"An error occurred during token validation: {ex.Message}");
            return null;
        }
    }

}
