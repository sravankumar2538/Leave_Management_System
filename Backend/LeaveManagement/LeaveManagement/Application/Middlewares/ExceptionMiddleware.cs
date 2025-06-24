using Newtonsoft.Json; // Ensure Newtonsoft.Json NuGet package is installed
using System.Net;
using System.Security.Authentication;

namespace LeaveManagement.Application.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            string ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown IP";
            _logger.LogInformation($"Request started - Method: {context.Request.Method}, IP: {ipAddress}, Path: {context.Request.Host}{context.Request.Path}");
            await _next(context);
            _logger.LogInformation($"Request finished: {context.Request.Host}{context.Request.Path} - Status: {context.Response.StatusCode}");
        }
        catch (Exception ex)
        {
            // Log the exception for debugging purposes
            await HandleExceptionAsync(context, ex);
            _logger.LogError(ex, "An exception occurred: {ErrorMessage}", ex.Message);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        HttpStatusCode statusCode = HttpStatusCode.InternalServerError;
        string errorMessage = "An unexpected error occurred."; // Default generic message

        // Determine status code and message based on exception type
        switch (exception)
        {
            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized; // HTTP 401
                errorMessage = exception.Message; // Display the specific UnauthorizedAccessException message
                break;
            // You can add more specific exception types here if needed,
            // and decide whether to expose exception.Message or a custom one.
            // case ArgumentException _:
            //     statusCode = HttpStatusCode.BadRequest; // HTTP 400
            //     errorMessage = exception.Message;
            //     break;
            case ArgumentOutOfRangeException:
                statusCode = HttpStatusCode.BadRequest; // HTTP 400
                errorMessage = exception.Message;
                break;
            case InvalidOperationException:
                statusCode = HttpStatusCode.Conflict; // HTTP 400
                errorMessage = exception.Message;
                break;
            case AuthenticationException:
                statusCode = HttpStatusCode.Unauthorized; // HTTP 400
                errorMessage = exception.Message;
                break;
            case FormatException:
                statusCode = HttpStatusCode.BadRequest; // HTTP 400
                errorMessage = exception.Message;
                break;
            case Exception:
                statusCode = HttpStatusCode.BadRequest; // HTTP 400
                errorMessage = exception.Message;
                break;
            default:
                // For all other unhandled exceptions, return a generic 500 error,
                // but still include the exception's message as requested.
                statusCode = HttpStatusCode.InternalServerError; 
                errorMessage = exception.Message; // Display the specific exception message
                break;
        }

        context.Response.StatusCode = (int)statusCode;

        // Create a structured error response
        var errorResponse = new
        {
            StatusCode = (int)statusCode,
            Message = errorMessage
        };

        return context.Response.WriteAsync(JsonConvert.SerializeObject(errorResponse.Message));
    }
}