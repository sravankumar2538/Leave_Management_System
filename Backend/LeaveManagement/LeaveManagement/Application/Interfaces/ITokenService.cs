using System.Security.Claims;
namespace LeaveManagement.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(int  employeeId, string role, int? id);
    int? GetUserIdFromCurrentRequest();
    string GetRoleFromCurrentRequest();
    ClaimsPrincipal? ValidateCurrentToken();
}
