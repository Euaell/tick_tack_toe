using Microsoft.EntityFrameworkCore;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<GameMove> GameMoves { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<PlayerStatistics> PlayerStatistics { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Username);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });

        // PlayerStatistics configuration
        modelBuilder.Entity<PlayerStatistics>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(u => u.Statistics)
                .HasForeignKey<PlayerStatistics>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Game configuration
        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.CurrentTurn).HasConversion<string>();
            entity.Property(e => e.Winner).HasConversion<string>();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.PlayerX)
                .WithMany(u => u.GamesAsPlayerX)
                .HasForeignKey(e => e.PlayerXId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.PlayerO)
                .WithMany(u => u.GamesAsPlayerO)
                .HasForeignKey(e => e.PlayerOId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // GameMove configuration
        modelBuilder.Entity<GameMove>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Symbol).HasConversion<string>();
            entity.Property(e => e.MadeAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Game)
                .WithMany(g => g.Moves)
                .HasForeignKey(e => e.GameId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ChatMessage configuration
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.SentAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Game)
                .WithMany(g => g.ChatMessages)
                .HasForeignKey(e => e.GameId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
