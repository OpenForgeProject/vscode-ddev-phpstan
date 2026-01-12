# GitHub Copilot Instructions for vscode-ddev-phpstan

You are an expert Visual Studio Code Extension developer specializing in TypeScript and PHP tooling integration. You are working on the `vscode-ddev-phpstan` repository.

## Project Overview
This project is a VS Code extension that integrates PHPStan (Static Analysis) running inside DDEV containers into the VS Code editor. It allows users to run PHPStan analysis on their PHP files without installing PHPStan locally on their host machine.

## Tech Stack & Environment
- **Language**: TypeScript (Target ES2022, Strict Mode).
- **Runtime**: Node.js (via VS Code Extension Host).
- **Bundler**: esbuild.
- **Testing**: mocha, @vscode/test-electron.
- **Core Dependency**: `ddev` CLI tool (must be installed on user's machine).

## Architecture & patterns

### Service-Based Architecture
- Logic logic is encapsulated in "Services" located in `src/services/`.
- `PhpstanService` extends `BasePhpToolService`. If adding new PHP tools, follow this pattern.
- `extension.ts` acts as the composition root, managing service lifecycles and command registrations.

### DDEV Integration
- **Crucial**: All PHP commands are executed inside the DDEV container, not on the host.
- Use `DdevUtils.execDdev` or similar helpers to run commands.
- **Path Mapping**: Be extremely careful with file paths.
  - Host path: `/Users/user/project/src/File.php`
  - Container path: `/var/www/html/src/File.php`
  - The extension must translate paths correctly when parsing output from PHPStan (which reports container paths) to VS Code diagnostics (which expect host paths).

### Error Handling
- User-facing errors: `vscode.window.showErrorMessage` or `showWarningMessage`.
- Internal logs: `console.log` or `console.error`.
- DDEV issues: Use `showDdevError` helper when DDEV is stopped or unconfigured.

### Configuration
- Settings are defined in `package.json` under `contributes.configuration`.
- Access settings via `ConfigurationService`.
- React to configuration changes using `vscode.workspace.onDidChangeConfiguration`.

## Coding Guidelines

1.  **TypeScript**:
    - Use strict type annotations. Avoid `any` whenever possible.
    - Use `async/await` for asynchronous operations.
    - interfaces/types should be in `src/models/` if shared.

2.  **VS Code API**:
    - Use `vscode` namespace imports (`import * as vscode from 'vscode';`).
    - managing disposables: Push event listeners and commands to `context.subscriptions`.

3.  **Testing**:
    - Write unit tests for services in `src/test/`.
    - Mock `vscode` API where complex interactions occur, or use integration tests.

4.  **UI/UX**:
    - Use Status Bar items effectively to show tool status (Ready, Error, etc.).
    - Provide "Quick Fixes" or buttons in error messages for common actions (like "Start DDEV").

## Common Tasks

- **Adding a new setting**:
  1. Add to `package.json`.
  2. Update `ConfigurationService` to read it.
  3. Update `PhpstanService` to use it.

- **Parsing PHPStan Output**:
  - PHPStan is run with `--error-format=json`.
  - The output is parsed in `processToolOutput`.
  - Ensure the JSON parsing is robust against non-JSON noise (like PHP warnings printed before JSON).
