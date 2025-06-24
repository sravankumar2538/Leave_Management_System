using LeaveManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.InfraStructure;

public static class InfraStructureServiceCollectionExtension
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {

        services = LeaveManagement.Infrastructure.DependencyInjection.AddInfrastructureServices(services, configuration);

        // Register LeaveDbContext with the connection string
        services.AddDbContext<LeaveDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        return services;
    }
}



