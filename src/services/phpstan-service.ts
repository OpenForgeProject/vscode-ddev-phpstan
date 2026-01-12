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
import { PhpstanConfig } from '../models/configuration';
import { PhpstanResult, PhpstanFileResult } from '../models/phpstan-result';
import { ConfigurationService } from './configuration-service';
import { DiagnosticUtils } from '../utils/diagnostic-utils';
import { BasePhpToolService, PhpToolConfig } from '../shared/services/base-php-tool-service';

/**
 * Service for analyzing PHP files using PHPStan
 */
export class PhpstanService extends BasePhpToolService {
    private config: PhpstanConfig;

    /**
     * Create a new PHPStan service
     *
     * @param context VS Code extension context
     */
    constructor(context: vscode.ExtensionContext) {
        super(context, 'phpstan', 'PHPStan');
        this.config = ConfigurationService.getConfig();
    }

    /**
     * Get the PHPStan configuration
     */
    protected getConfig(): PhpToolConfig {
        this.config = ConfigurationService.getConfig();
        return {
            enable: this.config.enable,
            validateOn: this.config.validateOn as 'save' | 'type',
            minSeverity: this.config.minSeverity as 'error' | 'warning' | 'info'
        };
    }

    /**
     * Build PHPStan command with configuration
     */
    protected buildToolCommand(filePath: string): string[] {
        const command = ['phpstan', 'analyze', '--error-format=json', '--no-progress'];

        // Use config file if specified, otherwise use individual settings
        if (this.config.configPath) {
            // Use specified config file
            command.push('-c', this.config.configPath);
        } else {
            // Try to auto-detect common PHPStan config files
            const autoConfigPath = this.detectPhpstanConfig();
            if (autoConfigPath) {
                console.log(`PHPStan: Auto-detected config file: ${autoConfigPath}`);
                command.push('-c', autoConfigPath);
            } else {
                // Use individual settings when no config file is found
                command.push(`--level=${this.config.level}`);

                // Add exclude paths
                if (this.config.excludePaths && this.config.excludePaths.length > 0) {
                    for (const excludePath of this.config.excludePaths) {
                        command.push(`--exclude=${excludePath}`);
                    }
                }
            }
        }

        // Add the file to analyze
        command.push(filePath);

        return command;
    }

    /**
     * Auto-detect common PHPStan configuration files
     */
    private detectPhpstanConfig(): string | null {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const commonConfigFiles = [
            'phpstan.neon',
            'phpstan.neon.dist',
            'phpstan.dist.neon',
            'phpstan-baseline.neon',
            '.phpstan.neon',
            'phpstan.xml',
            'phpstan.xml.dist'
        ];

        const fs = require('fs');
        const path = require('path');

        for (const configFile of commonConfigFiles) {
            const configPath = path.join(workspaceRoot, configFile);
            if (fs.existsSync(configPath)) {
                return configFile; // Return relative path
            }
        }

        return null;
    }

    /**
     * Handle configuration changes specific to PHPStan
     */
    protected onConfigurationChangedInternal(event: vscode.ConfigurationChangeEvent): void {
        // Reload configuration when it changes
        this.config = ConfigurationService.getConfig();
    }

    /**
     * Process PHPStan output and create diagnostics
     */
    protected processToolOutput(output: string, document: vscode.TextDocument): void {
        // Store original output for error reporting and debugging
        const originalOutput = output.trim();
        console.log(`PHPStan raw output (${originalOutput.length} chars):`, originalOutput);

        // Handle empty output (no errors found)
        if (!originalOutput) {
            console.log('PHPStan: Empty output, clearing diagnostics');
            this.diagnosticCollection.delete(document.uri);
            return;
        }

        try {
            // Parse JSON output
            const result = JSON.parse(originalOutput) as PhpstanResult;
            console.log('PHPStan parsed result:', JSON.stringify(result, null, 2));

            const diagnostics: vscode.Diagnostic[] = [];

            // Get the current file path (both absolute and relative)
            const currentFilePath = document.uri.fsPath;
            const currentRelativePath = vscode.workspace.asRelativePath(document.uri);

            console.log(`Looking for errors in file: ${currentFilePath} (relative: ${currentRelativePath})`);

            // Process files object - this is where PHPStan puts the actual errors
            if (result.files) {
                console.log('Available files in result:', Object.keys(result.files));

                // Try to find errors for the current file using various path formats
                const fileKeys = Object.keys(result.files);
                let fileResult: PhpstanFileResult | undefined;
                let matchedKey: string | undefined;

                // Try different path variations to match the file
                for (const fileKey of fileKeys) {
                    if (fileKey === currentFilePath ||
                        fileKey === currentRelativePath ||
                        vscode.workspace.asRelativePath(fileKey) === currentRelativePath ||
                        fileKey.endsWith(currentRelativePath) ||
                        currentFilePath.endsWith(fileKey)) {
                        fileResult = result.files[fileKey];
                        matchedKey = fileKey;
                        break;
                    }
                }

                if (fileResult && fileResult.messages) {
                    console.log(`Found ${fileResult.messages.length} errors for file ${matchedKey}`);

                    for (const error of fileResult.messages) {
                        const severity = DiagnosticUtils.getSeverity(error);
                        if (DiagnosticUtils.shouldReportSeverity(severity, this.config.minSeverity)) {
                            const diagnostic = DiagnosticUtils.createDiagnostic(error);
                            diagnostics.push(diagnostic);
                            console.log(`Added diagnostic: line ${error.line}, message: ${error.message}`);
                        } else {
                            console.log(`Skipped diagnostic due to severity filter: ${error.message}`);
                        }
                    }
                } else {
                    console.log('No errors found for current file in PHPStan results');
                }
            }

            // Also check the general errors array for configuration issues
            if (result.errors && result.errors.length > 0) {
                console.log('General PHPStan errors:', result.errors);
                for (const errorMessage of result.errors) {
                    // Create a diagnostic for general errors (usually configuration issues)
                    const diagnostic = new vscode.Diagnostic(
                        new vscode.Range(0, 0, 0, Number.MAX_VALUE),
                        errorMessage,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.source = 'phpstan';
                    diagnostics.push(diagnostic);
                }
            }

            // Update diagnostics
            if (diagnostics.length > 0) {
                console.log(`Setting ${diagnostics.length} diagnostics for ${document.uri.fsPath}`);
                this.diagnosticCollection.set(document.uri, diagnostics);
            } else {
                console.log('No diagnostics to set, clearing existing ones');
                this.diagnosticCollection.delete(document.uri);
            }

        } catch (parseError) {
            console.error('Error parsing PHPStan output:', parseError);
            console.error('Original PHPStan output:', originalOutput);

            // Handle non-JSON output - PHPStan might output plain text errors
            if (originalOutput.includes('Fatal error') ||
                originalOutput.includes('Parse error') ||
                originalOutput.includes('Syntax error')) {

                // Try to extract useful error information from plain text output
                const lines = originalOutput.split('\n');
                const errorLine = lines.find(line =>
                    line.includes('Fatal error') ||
                    line.includes('Parse error') ||
                    line.includes('Syntax error')
                );

                if (errorLine) {
                    // Create a diagnostic for the syntax/fatal error
                    const diagnostic = new vscode.Diagnostic(
                        new vscode.Range(0, 0, 0, Number.MAX_VALUE),
                        errorLine.trim(),
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.source = 'phpstan';
                    this.diagnosticCollection.set(document.uri, [diagnostic]);
                } else {
                    // Show a simplified error message for fatal errors
                    vscode.window.showErrorMessage(
                        'PHPStan encountered a fatal error. Check the file for syntax errors.',
                        { modal: false }
                    );
                }
            } else if (originalOutput.includes('Configuration file') && originalOutput.includes('not found')) {
                // Handle configuration file not found
                vscode.window.showErrorMessage(
                    'PHPStan configuration file not found. Check the configPath setting.',
                    { modal: false }
                );
            } else {
                // For other parsing errors, show the parse error but don't fail completely
                console.warn(`Failed to parse PHPStan output, but analysis may have succeeded: ${parseError instanceof Error ? parseError.message : String(parseError)}`);

                // Clear diagnostics since we couldn't parse the output
                this.diagnosticCollection.delete(document.uri);
            }
        }
    }
}
