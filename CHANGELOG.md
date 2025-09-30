# Changelog

All notable changes to the "DDEV PHPStan" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-09-30

### Added

- Initial release of DDEV PHPStan extension
- PHPStan integration with DDEV containers for seamless static analysis
- Real-time error highlighting in VS Code editor
- Status bar integration showing analysis state and results
- Configurable PHPStan analysis levels (0-9) with best practice defaults (level 6)
- Support for custom PHPStan configuration files with auto-detection
- Comprehensive exclude patterns for common directories (vendor/, var/, cache/, etc.)
- Validation timing options (on save or on type)
- Minimum severity filtering (error, warning, info)
- Debug command for troubleshooting analysis issues
- Problems panel integration with clickable error navigation
- Commands for manual analysis and extension management

### Features

- **DDEV Integration**: Runs PHPStan analysis directly in DDEV containers
- **Smart Configuration**: Auto-detects common PHPStan config files (phpstan.neon, etc.)
- **Best Practice Defaults**: Ships with production-ready settings (level 6, smart excludes)
- **Real-time Feedback**: Instant error highlighting and VS Code diagnostics integration
- **Flexible Settings**: Comprehensive configuration options for different project needs
- **Developer Experience**: Clear status indicators and helpful debug tools

### Configuration Options

- `ddev-phpstan.enable`: Enable/disable the extension (default: true)
- `ddev-phpstan.validateOn`: When to validate - "save" or "type" (default: "save")
- `ddev-phpstan.level`: PHPStan analysis level 0-9 (default: 6)
- `ddev-phpstan.minSeverity`: Minimum severity level (default: "warning")
- `ddev-phpstan.configPath`: Path to custom PHPStan configuration file
- `ddev-phpstan.excludePaths`: Paths to exclude from analysis (includes smart defaults)

### Commands

- `DDEV PHPStan: Analyze Current File` - Run analysis on the current file
- `DDEV PHPStan: Debug Analysis (Show Raw Output)` - Show raw PHPStan output for debugging
- `DDEV PHPStan: Enable` - Enable the extension
- `DDEV PHPStan: Disable` - Disable the extension
- `DDEV PHPStan: Toggle Enable/Disable` - Toggle extension state

### Technical Details

- Built with TypeScript and VS Code Extension API
- Uses esbuild for efficient bundling and fast compilation
- ESLint integration for code quality assurance
- Comprehensive test suite with Mocha framework
- Modular service-based architecture for maintainability
- Proper error handling and user feedback
