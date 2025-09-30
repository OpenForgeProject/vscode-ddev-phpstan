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

/**
 * Interface representing a PHPStan error from the JSON output
 */
export interface PhpstanError {
    /** The error message */
    message: string;

    /** Line number where the error occurs */
    line: number;

    /** Whether the error is ignorable (optional field in PHPStan output) */
    ignorable?: boolean;
}

/**
 * Interface representing a file with errors in PHPStan output
 */
export interface PhpstanFileResult {
    /** Number of errors in this file */
    errors: number;

    /** List of error messages in the file */
    messages: PhpstanError[];
}

/**
 * Interface representing the PHPStan analysis result
 */
export interface PhpstanResult {
    /** Total number of errors found */
    totals: {
        errors: number;
        file_errors: number;
    };

    /** Files with errors, keyed by file path */
    files: { [filePath: string]: PhpstanFileResult };

    /** Array of general errors (usually configuration errors) */
    errors: string[];
}
