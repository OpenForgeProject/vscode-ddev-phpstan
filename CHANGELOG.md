# Changelog

All notable changes to the "DDEV PHPStan" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-09-30

### Updated

- **Dependencies**: Major dependency updates for improved performance and security
  - `@types/node`: Updated from 18.19.128 to 24.6.0 (Node.js 24 LTS support)
  - `esbuild`: Updated from 0.24.2 to 0.25.10 (improved bundling performance)
  - `mocha`: Updated from 10.8.2 to 11.7.3 (enhanced testing framework)
  - `sinon`: Updated from 19.0.5 to 21.0.0 (modern mocking capabilities)
  - `@vscode/test-cli`: Updated from 0.0.10 to 0.0.11 (VS Code testing improvements)

- **GitHub Actions**: Updated to latest versions for better CI/CD performance
  - `actions/checkout`: Updated from v4 to v5 (Node.js 24 runtime)
  - `actions/setup-node`: Updated from v4 to v5 (enhanced caching and performance)
  - `hmarr/auto-approve-action`: Updated from v3 to v4 (Node.js 20 compatibility)
  - `softprops/action-gh-release`: Updated from v1 to v2 (improved release automation)

### Fixed

- **CI/CD**: Added missing `@vscode/test-electron` dependency for proper VS Code extension testing
- **Testing**: Resolved dependency conflicts and improved test stability

### Technical Details

- All major testing framework updates maintain backward compatibility
- Node.js 24 LTS support with improved type definitions
- Enhanced build performance with latest esbuild version
- Modernized GitHub Actions for better CI/CD reliability

## [0.2.0] - 2025-09-30

### Added

- **GitHub Workflows**: Complete CI/CD pipeline with automated testing and releases
  - Multi-platform testing (macOS, Ubuntu, Windows) with Node.js 18.x & 20.x
  - Automated code quality checks (ESLint, TypeScript compilation, security audit)
  - Automated release workflow with VS Code Marketplace and Open VSX publishing
  - Dependabot integration with auto-approve and auto-merge for dependency updates
- **Community Templates**: Professional issue templates and contribution guidelines
  - Structured bug report template with version info and reproduction steps
  - Feature request template with priority and categorization
  - Comprehensive contributing guidelines with development setup and PR process
- **Project Infrastructure**: Complete open source project setup
  - Dependabot configuration for weekly dependency updates
  - GitHub Actions for continuous integration and deployment
  - Community health files for better contributor experience

### Improved

- **Development Workflow**: Streamlined development and release process
- **Code Quality**: Automated linting, testing, and security checks
- **Community Support**: Clear guidelines for bug reports and feature requests
- **Release Management**: Automated publishing to extension marketplaces

### Technical Details

- GitHub Actions workflows for CI/CD automation
- Dependabot for automated dependency management
- Issue templates using GitHub's YAML format
- Multi-platform compatibility testing
- Security vulnerability scanning

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
