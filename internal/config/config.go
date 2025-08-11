package config

import (
	"fmt"

	"github.com/caarlos0/env/v10"
)

type Config struct {
	Server   ServerConfig   `envPrefix:""`
	Database DatabaseConfig `envPrefix:"DB_"`
	JWT      JWTConfig      `envPrefix:"JWT_"`
	Image    ImageConfig    `envPrefix:""`
	SMTP     SMTPConfig     `envPrefix:"SMTP_"`
}

type ServerConfig struct {
	Port    string `env:"PORT" envDefault:"8080"`
	Host    string `env:"HOST" envDefault:"localhost"`
	GinMode string `env:"GIN_MODE" envDefault:"debug"`
}

type DatabaseConfig struct {
	Type     string `env:"TYPE" envDefault:"sqlite"`
	Host     string `env:"HOST" envDefault:"localhost"`
	Port     int    `env:"PORT" envDefault:"5432"`
	Name     string `env:"NAME" envDefault:"choreme.db"`
	User     string `env:"USER" envDefault:""`
	Password string `env:"PASS" envDefault:""`
	SSLMode  string `env:"SSL_MODE" envDefault:"disable"`
}

type JWTConfig struct {
	Secret string `env:"SECRET" envDefault:"your-secret-key"`
}

type ImageConfig struct {
	MaxSizeMB        int `env:"MAX_IMAGE_SIZE_MB" envDefault:"5"`
	MaxDimensionPx   int `env:"MAX_IMAGE_DIMENSION_PX" envDefault:"500"`
}

type SMTPConfig struct {
	Host      string `env:"HOST"`
	Port      int    `env:"PORT" envDefault:"587"`
	User      string `env:"USER"`
	Password  string `env:"PASS"`
	FromEmail string `env:"FROM_EMAIL"`
	FromName  string `env:"FROM_NAME" envDefault:"ChoreMe"`
}

func Load() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}
	return cfg, nil
}

func (c *DatabaseConfig) ConnectionString() string {
	switch c.Type {
	case "postgres":
		return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
			c.User, c.Password, c.Host, c.Port, c.Name, c.SSLMode)
	case "mysql":
		return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true",
			c.User, c.Password, c.Host, c.Port, c.Name)
	case "sqlite":
		return c.Name
	default:
		return ""
	}
}

func (c *DatabaseConfig) DriverName() string {
	switch c.Type {
	case "postgres":
		return "postgres"
	case "mysql":
		return "mysql"
	case "sqlite":
		return "sqlite3"
	default:
		return ""
	}
}