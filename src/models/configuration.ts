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
 * Interface for the extension configuration
 */
export interface PhpstanConfig {
    /** Whether the extension is enabled */
    enable: boolean;

    /** When to validate: 'save' or 'type' */
    validateOn: string;

    /** PHPStan analysis level (0-9) */
    level: number;

    /** Minimum severity level for reported issues */
    minSeverity: string;

    /** Path to custom PHPStan configuration file (relative to workspace root) */
    configPath: string;

    /** Paths to exclude from analysis */
    excludePaths: string[];
}

/**
 * Default configuration values with PHPStan best practices
 */
export const DEFAULT_CONFIG: PhpstanConfig = {
    enable: true,
    validateOn: 'save',
    level: 6,  // Strong analysis level for good type checking
    minSeverity: 'warning',
    configPath: '',
    excludePaths: [
        'vendor/',
        'var/',
        'cache/',
        'public/bundles/',
        'node_modules/',
        'tests/fixtures/',
        'migrations/'
    ]
};
