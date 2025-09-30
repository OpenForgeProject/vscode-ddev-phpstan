/*
 * This file is part of the @openforgeproject/vscode-ddev-utils package.
 * Will be extracted to a shared NPM package in the future.
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
import { execSync } from 'child_process';

/**
 * DDEV project validation result
 */
export interface DdevValidationResult {
    isValid: boolean;
    errorType?: 'no-workspace' | 'no-ddev-project' | 'ddev-not-running' | 'tool-not-found' | 'unknown';
    errorMessage?: string;
    userMessage?: string;
}

/**
 * Utilities for working with DDEV projects and tools
 *
 * This class will be part of the @openforgeproject/vscode-ddev-utils package
 * and provides common functionality for all DDEV-based VS Code extensions.
 */
export class DdevUtils {
    /**
     * Check if the given workspace folder has a DDEV project
     *
     * @param workspacePath Path to the workspace folder
     * @returns true if workspace has a DDEV project, false otherwise
     */
    public static hasDdevProject(workspacePath: string): boolean {
        try {
            const ddevConfig = execSync('test -f .ddev/config.yaml && echo "exists"', {
                cwd: workspacePath,
                encoding: 'utf-8'
            });
            return ddevConfig.includes('exists');
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if DDEV is running in the given workspace
     *
     * @param workspacePath Path to the workspace folder
     * @returns true if DDEV is running, false otherwise
     */
    public static isDdevRunning(workspacePath: string): boolean {
        try {
            execSync('ddev exec echo "test"', {
                cwd: workspacePath,
                stdio: 'ignore'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if a specific tool is installed in the DDEV container
     *
     * @param toolName Name of the tool (e.g., 'phpmd', 'phpcs', 'phpstan')
     * @param workspacePath Path to the workspace folder
     * @returns true if tool is installed, false otherwise
     */
    public static isToolInstalled(toolName: string, workspacePath: string): boolean {
        try {
            execSync(`ddev exec ${toolName} --version`, {
                cwd: workspacePath,
                stdio: 'ignore'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Comprehensive validation of DDEV project and tool availability
     *
     * @param toolName Name of the tool to validate (e.g., 'phpmd', 'phpcs', 'phpstan')
     * @param workspacePath Path to the workspace folder
     * @returns Validation result with detailed information
     */
    public static validateDdevTool(toolName: string, workspacePath: string): DdevValidationResult {
        // First check if this is a DDEV project
        if (!this.hasDdevProject(workspacePath)) {
            return {
                isValid: false,
                errorType: 'no-ddev-project',
                userMessage: 'No DDEV project found'
            };
        }

        // Try to run the tool
        try {
            execSync(`ddev exec ${toolName} --version`, {
                cwd: workspacePath,
                stdio: 'ignore'
            });

            return {
                isValid: true
            };
        } catch (error: any) {
            // Check if DDEV is running
            if (!this.isDdevRunning(workspacePath)) {
                return {
                    isValid: false,
                    errorType: 'ddev-not-running',
                    userMessage: `DDEV project appears to be stopped. Please start DDEV with 'ddev start' to use ${toolName}.`
                };
            }

            // Tool not found
            const packageName = this.getComposerPackageName(toolName);
            return {
                isValid: false,
                errorType: 'tool-not-found',
                userMessage: `${toolName} is not installed in the DDEV container. Install it with: ddev composer require --dev ${packageName}`
            };
        }
    }

    /**
     * Get the composer package name for a given tool
     *
     * @param toolName Name of the tool
     * @returns Composer package name
     */
    private static getComposerPackageName(toolName: string): string {
        const packageMap: { [key: string]: string } = {
            'phpmd': 'phpmd/phpmd',
            'phpcs': 'squizlabs/php_codesniffer',
            'phpstan': 'phpstan/phpstan'
        };

        return packageMap[toolName] || `${toolName}/${toolName}`;
    }

    /**
     * Check if the given document is part of a DDEV project
     *
     * @param document The document to check
     * @returns true if the document is part of a DDEV project, false otherwise
     */
    public static isDdevProject(document: vscode.TextDocument): boolean {
        try {
            // Get workspace folder containing the current file
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            if (!workspaceFolder) {
                return false;
            }

            return this.hasDdevProject(workspaceFolder.uri.fsPath) &&
                   this.isDdevRunning(workspaceFolder.uri.fsPath);
        } catch (error) {
            return false;
        }
    }

    /**
     * Execute a command in the DDEV container
     *
     * @param command Command to execute
     * @param workspacePath Path to the workspace
     * @param allowedExitCodes Array of exit codes that should not throw (default: [0])
     * @returns Output of the command
     * @throws Error if the command fails with disallowed exit code
     */
    public static execDdev(command: string, workspacePath: string, allowedExitCodes: number[] = [0]): string {
        try {
            return execSync(`ddev exec ${command}`, {
                cwd: workspacePath,
                encoding: 'utf-8'
            });
        } catch (error: any) {
            // Check if this is an acceptable exit code (e.g., PHPStan returns 1 when errors are found)
            if (error.status && allowedExitCodes.includes(error.status)) {
                // Return stdout even if exit code is non-zero but allowed
                console.log(`Command exited with allowed code ${error.status}: ${command}`);
                return error.stdout || '';
            }

            // Enhance error message with more details
            const enhancedError = new Error(error.message || 'Command execution failed');
            enhancedError.name = error.name || 'CommandError';
            (enhancedError as any).status = error.status;
            (enhancedError as any).stderr = error.stderr;
            (enhancedError as any).stdout = error.stdout;
            (enhancedError as any).command = `ddev exec ${command}`;
            (enhancedError as any).workspacePath = workspacePath;

            throw enhancedError;
        }
    }
}
