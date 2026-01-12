# DDEV PHPStan Extension for VS Code

This extension integrates [PHPStan](https://phpstan.org/) with Visual Studio Code using [DDEV](https://ddev.com/) as the runtime environment. It provides real-time static analysis for PHP projects running in DDEV containers.

## Features

- Real-time PHP static analysis using PHPStan through DDEV
- **Easy enable/disable functionality per project**
- Configurable validation triggers (on save or on type)
- Customizable PHPStan levels and severity filtering
- Automatic DDEV project detection
- Problems panel integration with clickable issue links
- Status bar indicator showing extension state

## Requirements

- [VS Code](https://code.visualstudio.com/) 1.108.0 or higher
- [DDEV](https://github.com/ddev/ddev) project with running container
- PHPStan installed in your DDEV container

## Installation

Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=OpenForgeProject.vscode-ddev-phpstan) or search for "DDEV PHPStan" in VS Code's extension panel.

Install [PHPStan](https://github.com/phpstan/phpstan) in your DDEV container:
```bash
ddev composer require --dev phpstan/phpstan
```

## Usage

1. Open a DDEV project in VS Code
2. The extension automatically analyzes PHP files when you save them
3. Issues appear in the Problems panel and are highlighted in the editor
4. Click on issues to view detailed information and external documentation

### Enable/Disable Extension

Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):
- `DDEV PHPStan: Enable` - Enable the extension
- `DDEV PHPStan: Disable` - Disable the extension
- `DDEV PHPStan: Toggle Enable/Disable` - Toggle the extension state

Or click the status bar item to access commands quickly.

## Configuration

Key settings in VS Code preferences:

- `ddev-phpstan.enable`: Enable/disable the extension (default: `true`)
- `ddev-phpstan.validateOn`: When to validate (`"save"` or `"type"`)
- `ddev-phpstan.level`: PHPStan analysis level 0-9 (default: `6` - recommended for most projects)
- `ddev-phpstan.minSeverity`: Minimum severity level (`"error"`, `"warning"`, `"info"`)
- `ddev-phpstan.configPath`: Path to custom PHPStan configuration file. If left empty, the extension automatically looks for common configuration files like `phpstan.neon`, `phpstan.neon.dist`, `phpstan.dist.neon` in the workspace root.
- `ddev-phpstan.excludePaths`: Array of paths to exclude from analysis (includes common exclusions by default)

**Important:** When `configPath` is specified or an auto-detected configuration file is found, the extension will use that configuration file. In this case, the `level` and `excludePaths` settings from VS Code are ignored, as these should be defined in the PHPStan configuration file itself.

### Example Configuration

```json
{
  "ddev-phpstan.enable": true,
  "ddev-phpstan.validateOn": "save",
  "ddev-phpstan.level": 6,
  "ddev-phpstan.minSeverity": "warning",
  "ddev-phpstan.configPath": "",
  "ddev-phpstan.excludePaths": [
    "vendor/",
    "var/",
    "cache/",
    "public/bundles/",
    "node_modules/",
    "tests/fixtures/",
    "migrations/"
  ]
}
```

**Best Practice Defaults:** The extension comes pre-configured with sensible defaults:
- **Analysis Level 6**: Provides strong type checking without being overly strict
- **Common Exclusions**: Automatically excludes vendor code, cache directories, and other common paths that shouldn't be analyzed
- **Save-based Validation**: Runs analysis when files are saved for optimal performance

**Note:** When `configPath` is set to a specific PHPStan configuration file (or one is auto-detected), the `level` and `excludePaths` settings will be ignored, and these values should instead be configured in your PHPStan configuration file.

## Status Bar

The extension shows its status in the VS Code status bar:

- **$(check) PHPStan** - Extension active, no issues in current file
- **$(error) PHPStan** - Extension active, issues found in current file
- **$(warning) PHPStan** - DDEV/PHPStan not available (click for options)
- **$(circle-slash) PHPStan** - Extension disabled (click to enable)

## Commands

Available commands in the Command Palette:

- `DDEV PHPStan: Analyze Current File` - Run PHPStan analysis on the current file
- `DDEV PHPStan: Debug Analysis (Show Raw Output)` - Show raw PHPStan JSON output for debugging
- `DDEV PHPStan: Enable` - Enable the extension
- `DDEV PHPStan: Disable` - Disable the extension
- `DDEV PHPStan: Toggle Enable/Disable` - Toggle extension state

## Troubleshooting

### PHPStan not found

If you see "PHPStan service is not available":

1. Ensure DDEV is running: `ddev start`
2. Install PHPStan: `ddev composer require --dev phpstan/phpstan`
3. Restart VS Code or click "Retry"

### DDEV not running

If you see "DDEV appears to be stopped":

1. Start DDEV: `ddev start`
2. Click "Start DDEV" in the error message
3. Or disable the extension for this project

### Configuration file errors

If you see "PHPStan configuration error":

1. Check that your `ddev-phpstan.configPath` setting points to a valid file
2. Ensure the configuration file syntax is correct
3. Try running PHPStan manually: `ddev exec phpstan analyse --help`

### PHPStan exit codes

PHPStan uses different exit codes to indicate different states:
- **Exit code 0**: No errors found
- **Exit code 1**: Errors found (this is normal and expected)
- **Exit code 2**: Configuration error or fatal error

The extension handles exit codes 0 and 1 as successful execution, only treating exit code 2 and higher as actual failures.

### No issues detected

PHPStan might not find issues if:

- The analysis level is too low (try increasing `ddev-phpstan.level`)
- Files are excluded by your PHPStan configuration
- The minimum severity level filters out issues
- PHPStan configuration is missing or incorrect

**Debug Steps:**
1. Use `DDEV PHPStan: Debug Analysis (Show Raw Output)` to see the actual PHPStan JSON output
2. Check the VS Code Developer Console (Help → Toggle Developer Tools → Console) for detailed logs
3. Verify PHPStan works manually: `ddev exec phpstan analyse src/your-file.php --error-format=json`

## Development

This extension is built using:

- TypeScript
- VS Code Extension API
- esbuild for bundling
- Mocha for testing

### Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

GPL-3.0 License. See [LICENSE](LICENSE) for details.

## About

Developed by [OpenForgeProject](https://github.com/OpenForgeProject) as part of a suite of DDEV-based VS Code extensions for PHP development.

## Related Extensions

- [DDEV PHPMD Extension](https://marketplace.visualstudio.com/items?itemName=OpenForgeProject.vscode-ddev-phpmd) - PHP Mess Detector integration
