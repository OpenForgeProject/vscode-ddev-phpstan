# Changelog

All notable changes to this project will be documented in this file. This project uses [Release Please](https://github.com/googleapis/release-please) to automate releases and changelog management.

## [0.5.2](https://github.com/OpenForgeProject/vscode-ddev-phpstan/compare/v0.5.1...v0.5.2) (2026-01-29)


### Bug Fixes

* resolve npm audit vulnerabilities ([93e18cc](https://github.com/OpenForgeProject/vscode-ddev-phpstan/commit/93e18cce26c248c130234d62b77b35dc05f1eaf9))
* trigger release for dependency updates ([cc20c59](https://github.com/OpenForgeProject/vscode-ddev-phpstan/commit/cc20c598c85b5f2e9e7203837d538aa47470c423))

## [0.5.1](https://github.com/OpenForgeProject/vscode-ddev-phpstan/compare/v0.4.2...v0.5.1) (2026-01-12)

### Features

- **DDEV Execution**: Wrapped execDdev command with XDEBUG_MODE=off for better performance ([#44](https://github.com/OpenForgeProject/vscode-ddev-phpstan/pull/44))
- **Release Management**: Updated release workflow and token configuration ([#60](https://github.com/OpenForgeProject/vscode-ddev-phpstan/pull/60), [#62](https://github.com/OpenForgeProject/vscode-ddev-phpstan/pull/62))

### Fixed

- **Error Handling**: Improved null status handling in DDEV checks and argument processing ([#58](https://github.com/OpenForgeProject/vscode-ddev-phpstan/pull/58))
- **Code Quality**: Addressed code scanning alerts and review findings ([#56](https://github.com/OpenForgeProject/vscode-ddev-phpstan/pull/56), [#57](https://github.com/OpenForgeProject/vscode-ddev-phpstan/pull/57))
- **Dependencies**: Updated minor dependencies and security patches

## [0.4.2](https://github.com/OpenForgeProject/vscode-ddev-phpstan/compare/v0.4.1...v0.4.2) (2025-10-01)

### Changed

- **GitHub Actions**: Updated workflows to use dynamic Node.js version tags
  - CI tests now use `lts/*` and `latest` instead of specific versions (20.x, 22.x)
  - Release workflow uses `lts/*` for stability instead of latest
  - Automatic adaptation to new Node.js versions without manual updates

### Improved

- **Release Process**: Enhanced GitHub release workflow with custom changelog extraction
  - Automatic extraction of version-specific changelog content for releases
  - Improved version handling and release naming
  - Better integration with repository changelog structure

### Technical Details

- Node.js version management now future-proof with semantic tags
- Release workflow only triggers on tag pushes (v*.*.*) for precise control
- Custom changelog parsing for meaningful release notes
- Maintained compatibility across all supported platforms (macOS, Ubuntu, Windows)

## [0.4.1](https://github.com/OpenForgeProject/vscode-ddev-phpstan/compare/v0.4.0...v0.4.1) (2025-10-01)

### Added

- **Publishing Preparation**: Complete setup for VS Code Marketplace and Open VSX Registry
  - Added `.vscodeignore` file to exclude development files from extension package
  - Added publishing scripts for both VS Code Marketplace (`publish:vscode`) and Open VSX Registry (`publish:ovsx`)
  - Optimized package size by excluding source files, build tools, and development dependencies
  - Package size reduced to 155.64 KB with only essential runtime files

### Improved

- **Package Quality**: Enhanced extension package with proper file exclusions
- **Distribution**: Ready for automated publishing via GitHub Actions
- **Developer Experience**: Clear publishing workflow with npm scripts

### Technical Details

- Extension package now includes only: compiled JavaScript, assets, documentation, and license
- Source TypeScript files excluded from distribution package
- Build tools and configuration files excluded from package
- Maintained full functionality while reducing package size
- GitHub Actions ready for automated marketplace publishing

## [0.4.0](https://github.com/OpenForgeProject/vscode-ddev-phpstan/compare/v0.3.0...v0.4.0) (2025-09-30)

### Changed

- **Build System**: Complete migration from JavaScript to TypeScript for build configuration
  - `esbuild.js` → `esbuild.ts`: Build configuration now fully typed with TypeScript interfaces
  - Added `tsx` dependency for direct TypeScript execution without compilation step
  - Updated npm scripts to use `tsx` for running TypeScript files directly
  - Cleaned up duplicate and legacy JavaScript build files

### Improved

- **Type Safety**: Enhanced type safety across build infrastructure with proper TypeScript interfaces
- **Developer Experience**: Better IntelliSense and error detection in build configuration
- **Code Quality**: Significantly reduced JavaScript percentage in source files
- **Build Performance**: Streamlined build process with modern TypeScript tooling

### Technical Details

- Source code is now primarily TypeScript (11 TypeScript files vs 2 configuration files)
- Only `eslint.config.mjs` and `.vscode-test.mjs` remain as JavaScript (tooling requirements)
- All build and development workflows use native TypeScript execution via `tsx`
- Enhanced type annotations for esbuild plugins and configuration objects
- Maintained full backward compatibility with existing functionality

## [0.3.0](https://github.com/OpenForgeProject/vscode-ddev-phpstan/compare/v0.2.0...v0.3.0) (2025-09-30)

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

## [0.2.0](https://github.com/OpenForgeProject/vscode-ddev-phpstan/compare/v0.1.0...v0.2.0) (2025-09-30)

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

## [0.1.0](https://github.com/OpenForgeProject/vscode-ddev-phpstan/releases/tag/v0.1.0) (2025-09-30)

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
