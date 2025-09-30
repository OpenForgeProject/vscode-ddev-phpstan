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
import { PhpstanError } from '../models/phpstan-result';

/**
 * Utilities for handling diagnostics
 */
export class DiagnosticUtils {
    /**
     * Create a diagnostic from a PHPStan error
     *
     * @param error The PHPStan error
     * @returns VS Code diagnostic
     */
    public static createDiagnostic(error: PhpstanError): vscode.Diagnostic {
        // PHPStan line numbers are 1-based, VS Code uses 0-based
        const line = Math.max(0, error.line - 1);
        const range = new vscode.Range(
            new vscode.Position(line, 0),
            new vscode.Position(line, Number.MAX_VALUE)
        );

        const diagnostic = new vscode.Diagnostic(
            range,
            error.message,
            vscode.DiagnosticSeverity.Error // PHPStan reports all issues as errors by default
        );

        // Set the source
        diagnostic.source = 'phpstan';

        return diagnostic;
    }

    /**
     * Check if a diagnostic severity should be reported based on minimum severity setting
     *
     * @param severity Diagnostic severity
     * @param minSeverity Minimum severity setting
     * @returns true if the diagnostic should be reported
     */
    public static shouldReportSeverity(severity: vscode.DiagnosticSeverity, minSeverity: string): boolean {
        switch (minSeverity) {
            case 'error':
                return severity === vscode.DiagnosticSeverity.Error;
            case 'warning':
                return severity <= vscode.DiagnosticSeverity.Warning;
            case 'info':
                return true;
            default:
                return true;
        }
    }

    /**
     * Get diagnostic severity for PHPStan errors
     * PHPStan typically reports everything as errors, but we can categorize based on message content
     *
     * @param error The PHPStan error
     * @returns VS Code diagnostic severity
     */
    public static getSeverity(error: PhpstanError): vscode.DiagnosticSeverity {
        // PHPStan doesn't provide severity levels like PHPMD, so we treat all as errors
        // In the future, this could be enhanced to categorize based on message patterns
        return vscode.DiagnosticSeverity.Error;
    }
}
