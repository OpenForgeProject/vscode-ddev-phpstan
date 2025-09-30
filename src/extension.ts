/*
 * This file is part of the vscode-ddev-phpstan extension.
 *
 * © OpenForgeProject
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import * as vscode from 'vscode';
import { PhpstanService } from './services/phpstan-service';
import { DdevUtils } from './shared/utils/ddev-utils';
import type { DdevValidationResult } from './shared/utils/ddev-utils';
import { ConfigurationService } from './services/configuration-service';

// Global service instance
let phpstanService: PhpstanService | undefined;

// Status bar item
let statusBarItem: vscode.StatusBarItem | undefined;

// Track current file diagnostic status
let currentFileHasIssues = false;

// Constants for status values
const SERVICE_STATUS = {
    DISABLED: 'disabled',
    READY: 'ready',
    HAS_ISSUES: 'has-issues',
    NOT_AVAILABLE: 'not-available'
} as const;

type ServiceStatus = typeof SERVICE_STATUS[keyof typeof SERVICE_STATUS];

// Track DDEV service status
let ddevServiceStatus: ServiceStatus = SERVICE_STATUS.DISABLED;

// Extension context for reinitialization
let extensionContext: vscode.ExtensionContext | undefined;

/**
 * Get the extension context
 */
function getExtensionContext(): vscode.ExtensionContext {
    if (!extensionContext) {
        throw new Error('Extension context not available');
    }
    return extensionContext;
}

/**
 * Shows standardized error message for DDEV-related issues with appropriate action buttons
 */
function showDdevError(validationResult: DdevValidationResult): void {
    const message = validationResult.userMessage || 'DDEV configuration issue';

    // Determine appropriate buttons based on error type
    const buttons: string[] = [];

    if (message.includes('appears to be stopped') ||
        message.includes('not currently running')) {
        buttons.push("Start DDEV");
    }

    buttons.push("Disable for this project");

    vscode.window.showWarningMessage(message, ...buttons).then(selection => {
        if (selection === "Start DDEV") {
            // Get the current workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (workspaceFolder) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Starting DDEV...",
                    cancellable: false
                }, async () => {
                    try {
                        await vscode.commands.executeCommand('workbench.action.terminal.new');
                        await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
                            text: `cd "${workspaceFolder.uri.fsPath}" && ddev start\n`
                        });
                        vscode.window.showInformationMessage("DDEV start command sent to terminal");
                    } catch (error) {
                        vscode.window.showErrorMessage("Failed to start DDEV: " + error);
                    }
                });
            }
        } else if (selection === "Disable for this project") {
            vscode.commands.executeCommand('ddev-phpstan.disable');
        }
    });
}

/**
 * Analyze the current file if the service is available and enabled
 */
function analyzeCurrentFile() {
    const config = ConfigurationService.getConfig();
    if (!config.enable) {
        vscode.window.showWarningMessage('PHPStan is disabled. Enable it first to analyze files.');
        return;
    }

    // Try to initialize service if not available
    if (!phpstanService) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            console.log('Attempting to reinitialize PHPStan service...');

            const validationResult = DdevUtils.validateDdevTool('phpstan', workspaceFolders[0].uri.fsPath);
            if (!validationResult.isValid) {
                showDdevError(validationResult);
                return;
            }

            // If validation passed, try to initialize service
            const success = initializeService(getExtensionContext(), workspaceFolders[0], true);
            if (!success) {
                return;
            }
        } else {
            vscode.window.showWarningMessage('No workspace folder found.');
            return;
        }
    }

    // Service should be available now
    if (phpstanService) {
        phpstanService.analyzeCurrentFile();
    }
}

/**
 * Debug analyze the current file - shows raw PHPStan output
 */
function debugAnalyzeCurrentFile() {
    const config = ConfigurationService.getConfig();
    if (!config.enable) {
        vscode.window.showWarningMessage('PHPStan is disabled. Enable it first to debug analysis.');
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'php') {
        vscode.window.showWarningMessage('Please open a PHP file to debug PHPStan analysis.');
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('No workspace folder found.');
        return;
    }

    const workspaceFolder = workspaceFolders[0];
    const validationResult = DdevUtils.validateDdevTool('phpstan', workspaceFolder.uri.fsPath);
    if (!validationResult.isValid) {
        showDdevError(validationResult);
        return;
    }

    // Build the command manually like the service does
    const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
    const phpstanConfig = ConfigurationService.getConfig();

    let command = `phpstan analyse "${relativePath}" --error-format=json --no-progress`;

    if (phpstanConfig.configPath) {
        const configPath = phpstanConfig.configPath.startsWith('/')
            ? phpstanConfig.configPath
            : vscode.workspace.asRelativePath(phpstanConfig.configPath);
        command += ` --configuration="${configPath}"`;
    } else {
        command += ` --level=${phpstanConfig.level}`;
        if (phpstanConfig.excludePaths && phpstanConfig.excludePaths.length > 0) {
            for (const excludePath of phpstanConfig.excludePaths) {
                command += ` --exclude="${excludePath}"`;
            }
        }
    }

    // Execute and show raw output
    try {
        console.log(`Debug: Executing PHPStan command: ${command}`);
        const output = DdevUtils.execDdev(command, workspaceFolder.uri.fsPath, [0, 1]);

        // Show output in a new document
        vscode.workspace.openTextDocument({
            content: `PHPStan Debug Output for: ${relativePath}\n` +
                    `Command: ddev exec ${command}\n` +
                    `Output length: ${output.length} characters\n` +
                    `${'='.repeat(80)}\n\n` +
                    output,
            language: 'json'
        }).then(doc => {
            vscode.window.showTextDocument(doc);
        });

    } catch (error: any) {
        vscode.window.showErrorMessage(`Debug execution failed: ${error.message}`);
        console.error('Debug execution error:', error);
    }
}

/**
 * Update the DDEV service status
 */
function updateDdevServiceStatus() {
    const config = ConfigurationService.getConfig();

    if (!config.enable) {
        ddevServiceStatus = SERVICE_STATUS.DISABLED;
        return;
    }

    // Check if we're in a workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        ddevServiceStatus = SERVICE_STATUS.NOT_AVAILABLE;
        return;
    }

    const workspaceFolder = workspaceFolders[0];
    const validationResult = DdevUtils.validateDdevTool('phpstan', workspaceFolder.uri.fsPath);

    if (!validationResult.isValid) {
        ddevServiceStatus = SERVICE_STATUS.NOT_AVAILABLE;
    } else if (currentFileHasIssues) {
        ddevServiceStatus = SERVICE_STATUS.HAS_ISSUES;
    } else {
        ddevServiceStatus = SERVICE_STATUS.READY;
    }
}

/**
 * Check if the current active file has PHPStan issues
 */
function checkCurrentFileStatus() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !statusBarItem) {
        currentFileHasIssues = false;
        updateDdevServiceStatus();
        updateStatusBar();
        return;
    }

    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    const phpstanDiagnostics = diagnostics.filter(d => d.source === 'phpstan');

    currentFileHasIssues = phpstanDiagnostics.length > 0;
    updateDdevServiceStatus();
    updateStatusBar();
}

/**
 * Update status bar based on current configuration and file status
 */
function updateStatusBar() {
    if (!statusBarItem) {
        return;
    }

    switch (ddevServiceStatus) {
        case SERVICE_STATUS.DISABLED:
            // Extension is disabled
            statusBarItem.text = "$(circle-slash) PHPStan";
            statusBarItem.tooltip = "PHPStan is disabled. Click to enable.";
            statusBarItem.command = "ddev-phpstan.enable";
            statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
            break;

        case SERVICE_STATUS.NOT_AVAILABLE:
            // DDEV not running or tool not installed
            statusBarItem.text = "$(warning) PHPStan";
            statusBarItem.tooltip = "PHPStan service is not available. Click to retry or check DDEV status.";
            statusBarItem.command = "ddev-phpstan.analyzeCurrentFile";
            statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
            break;

        case SERVICE_STATUS.HAS_ISSUES:
            // Extension is enabled and current file has issues
            statusBarItem.text = "$(error) PHPStan";
            statusBarItem.tooltip = "PHPStan found issues in current file. Click to analyze again.";
            statusBarItem.command = "ddev-phpstan.analyzeCurrentFile";
            statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
            break;

        case SERVICE_STATUS.READY:
        default:
            // Extension is enabled and current file is clean (or not analyzed yet)
            statusBarItem.text = "$(check) PHPStan";
            statusBarItem.tooltip = "PHPStan is active. Click to analyze current file.";
            statusBarItem.command = "ddev-phpstan.analyzeCurrentFile";
            statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
            break;
    }
}

/**
 * Initialize or reinitialize the PHPStan service based on configuration
 */
function initializeService(context: vscode.ExtensionContext, workspaceFolder: vscode.WorkspaceFolder, silent: boolean = false) {
    const config = ConfigurationService.getConfig();

    if (config.enable) {
        if (!phpstanService) {
            const validationResult = DdevUtils.validateDdevTool('phpstan', workspaceFolder.uri.fsPath);

            if (!validationResult.isValid) {
                // Only show error if not silent (e.g., during initial activation)
                if (!silent) {
                    showDdevError(validationResult);
                }
                updateDdevServiceStatus();
                updateStatusBar();
                return false;
            }

            phpstanService = new PhpstanService(context);
            console.log('PHPStan service initialized.');
        }
    } else {
        if (phpstanService) {
            phpstanService.dispose();
            phpstanService = undefined;
            console.log('PHPStan service disposed.');
        }
    }

    updateDdevServiceStatus();
    updateStatusBar();
    return true;
}

/**
 * Activate the extension
 *
 * @param context VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('DDEV PHPStan extension is now active!');

    // Store extension context for later use
    extensionContext = context;

    // Check if we're in a workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        console.log('No workspace folder found. DDEV PHPStan extension will not activate.');
        return;
    }

    // Get the first workspace folder
    const workspaceFolder = workspaceFolders[0];

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Initialize service based on configuration
    initializeService(context, workspaceFolder);

    // Set up periodic check for DDEV recovery (every 30 seconds)
    const periodicCheck = setInterval(() => {
        const config = ConfigurationService.getConfig();
        if (config.enable && !phpstanService) {
            console.log('Periodic check: Attempting to recover PHPStan service...');
            initializeService(context, workspaceFolder, true); // Silent retry
        }
    }, 30000);

    // Clean up interval on extension deactivation
    context.subscriptions.push({
        dispose: () => clearInterval(periodicCheck)
    });

    // Helper function for configuration updates
    const updateConfiguration = async (enable: boolean) => {
        await ConfigurationService.updateConfig('enable', enable);
        vscode.window.showInformationMessage(`DDEV PHPStan ${enable ? 'enabled' : 'disabled'}.`);
    };

    // Register commands
    const commands = [
        ['ddev-phpstan.analyzeCurrentFile', analyzeCurrentFile],
        ['ddev-phpstan.debugCurrentFile', debugAnalyzeCurrentFile],
        ['ddev-phpstan.enable', () => updateConfiguration(true)],
        ['ddev-phpstan.disable', () => updateConfiguration(false)],
        ['ddev-phpstan.toggle', async () => {
            const currentValue = ConfigurationService.getConfig().enable;
            await updateConfiguration(!currentValue);
        }]
    ] as const;

    commands.forEach(([command, handler]) => {
        context.subscriptions.push(vscode.commands.registerCommand(command, handler));
    });

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (ConfigurationService.affectsConfiguration(event, 'enable')) {
                initializeService(context, workspaceFolder);
            }
        })
    );

    // Listen for active editor changes to update status bar
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            checkCurrentFileStatus();
        })
    );

    // Listen for diagnostic changes to update status bar
    context.subscriptions.push(
        vscode.languages.onDidChangeDiagnostics((event) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.uris.some(uri => uri.toString() === editor.document.uri.toString())) {
                checkCurrentFileStatus();
            }
        })
    );

    // Initial check of current file status
    checkCurrentFileStatus();
}

/**
 * Deactivate the extension
 */
export function deactivate() {
    // Clean up resources
    if (phpstanService) {
        phpstanService.dispose();
        phpstanService = undefined;
    }

    // Dispose of status bar item
    if (statusBarItem) {
        statusBarItem.dispose();
        statusBarItem = undefined;
    }
}
