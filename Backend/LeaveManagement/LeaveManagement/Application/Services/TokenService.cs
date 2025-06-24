using LeaveManagement.Application.Utls;
using LeaveManagement.Domain.Models;
using System.Security.Claims;

namespace LeaveManagement.Application.Services
{
    public class TokenService : ITokenService
    {
        private readonly JwtHelper _jwtHelper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TokenService(IConfiguration configuration, JwtHelper jwtHelper, IHttpContextAccessor httpContextAccessor)
        {
            _jwtHelper = new JwtHelper(configuration);
            _httpContextAccessor = httpContextAccessor;
        }

        public JwtHelper JwtHelper => _jwtHelper;
        public IHttpContextAccessor HttpContextAccessor => _httpContextAccessor;

        public string GenerateToken(int employeeId, string role, int? id = null)
            => JwtHelper.GenerateJwtToken(employeeId, role);
        public ClaimsPrincipal? ValidateCurrentToken()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
                return null;

            if (
                context.Items.TryGetValue("ClaimsPrincipal", out var cachedPrincipal)
                && cachedPrincipal is ClaimsPrincipal principal
            )
                return principal;

            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
            {
                token = context.Request.Cookies["jwt"];
            }
            if (string.IsNullOrEmpty(token))
                return null;

            var validatedPrincipal = _jwtHelper.ValidateJwtToken(token);
            if (validatedPrincipal != null)
            {
                context.Items["ClaimsPrincipal"] = validatedPrincipal;
            }
            return validatedPrincipal;
        }

        public Guid? GetLoggedInUserFromCurrentRequest()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
                return null;

            if (context.Items.TryGetValue("employeeId", out var cachedUserId) && cachedUserId is Guid guid)
                return guid;

            var principal = ValidateCurrentToken();
            if (principal == null)
                return null;
            var idClaim = principal.FindFirst("employeeId")?.Value;
            var roleClaim = principal.FindFirst("role")?.Value;
            if (Guid.TryParse(idClaim, out var employeeId))
            {
                context.Items["employeeId"] = employeeId;
                return employeeId;
            }
            return null;
        }

        public int? GetUserIdFromCurrentRequest()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
                return null;

            if (context.Items.TryGetValue("userId", out var cachedUserId) && cachedUserId is int id)
                return id;

            var principal = ValidateCurrentToken();
            if (principal == null)
                return null;
            var idClaim = principal.FindFirst("employeeId")?.Value;
            if (int.TryParse(idClaim, out var employeeId))
            {
                context.Items["employeeId"] = employeeId;
                return employeeId;
            }
            return null;
        }
        public string GetRoleFromCurrentRequest()
        {
            var principal = ValidateCurrentToken();
            return principal?.FindFirst(ClaimTypes.Role)?.Value;
        }

    }
}
