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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { afterEach, beforeEach } from 'mocha';
import { DdevUtils } from '../shared/utils/ddev-utils';

suite('DdevUtils Test Suite', () => {
    let sandbox: sinon.SinonSandbox;
    let execSyncStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Mock the entire child_process module
        const childProcess = require('child_process');
        execSyncStub = sandbox.stub(childProcess, 'execSync');
    });

    afterEach(() => {
        sandbox.restore();
    });

    test('hasDdevProject returns true when .ddev/config.yaml exists', () => {
        execSyncStub.returns('exists\n');

        const result = DdevUtils.hasDdevProject('/test/workspace');

        assert.strictEqual(result, true);
        assert.strictEqual(execSyncStub.calledOnce, true);
    });

    test('hasDdevProject returns false when .ddev/config.yaml does not exist', () => {
        execSyncStub.throws(new Error('File not found'));

        const result = DdevUtils.hasDdevProject('/test/workspace');

        assert.strictEqual(result, false);
    });

    test('isDdevRunning returns true when DDEV container is running', () => {
        execSyncStub.returns('');

        const result = DdevUtils.isDdevRunning('/test/workspace');

        assert.strictEqual(result, true);
    });

    test('isDdevRunning returns false when DDEV container is not running', () => {
        execSyncStub.throws(new Error('Container not running'));

        const result = DdevUtils.isDdevRunning('/test/workspace');

        assert.strictEqual(result, false);
    });

    test('isToolInstalled returns true when tool is available', () => {
        execSyncStub.returns('PHPStan 1.10.0\n');

        const result = DdevUtils.isToolInstalled('phpstan', '/test/workspace');

        assert.strictEqual(result, true);
    });

    test('isToolInstalled returns false when tool is not available', () => {
        execSyncStub.throws(new Error('Command not found'));

        const result = DdevUtils.isToolInstalled('phpstan', '/test/workspace');

        assert.strictEqual(result, false);
    });

    test('validateDdevTool returns invalid result when no DDEV project found', () => {
        execSyncStub.throws(new Error('File not found'));

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.errorType, 'no-ddev-project');
        assert.strictEqual(result.userMessage, 'No DDEV project found');
    });

    test('validateDdevTool returns valid result when tool is available', () => {
        // First call (hasDdevProject) succeeds
        execSyncStub.onFirstCall().returns('exists\n');
        // Second call (tool version check) succeeds
        execSyncStub.onSecondCall().returns('PHPStan 1.10.0\n');

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, true);
        assert.strictEqual(result.errorType, undefined);
    });

    test('validateDdevTool returns error message for DDEV issues', () => {
        // First call (hasDdevProject) succeeds
        execSyncStub.onFirstCall().returns('exists\n');
        // Second call (tool version check) fails
        execSyncStub.onSecondCall().throws(new Error('Container not running'));
        // Third call (isDdevRunning) fails
        execSyncStub.onThirdCall().throws(new Error('DDEV not running'));

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.errorType, 'ddev-not-running');
        assert.ok(result.userMessage?.includes('appears to be stopped'));
    });

    test('validateDdevTool returns tool not found message when tool is missing', () => {
        // First call (hasDdevProject) succeeds
        execSyncStub.onFirstCall().returns('exists\n');
        // Second call (tool version check) fails
        execSyncStub.onSecondCall().throws(new Error('Command not found'));
        // Third call (isDdevRunning) succeeds
        execSyncStub.onThirdCall().returns('');

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.errorType, 'tool-not-found');
        assert.ok(result.userMessage?.includes('phpstan is not installed'));
        assert.ok(result.userMessage?.includes('phpstan/phpstan'));
    });

    test('execDdev wraps command with XDEBUG_MODE=off', () => {
        execSyncStub.returns('output');

        const result = DdevUtils.execDdev('phpstan analyze', '/test/workspace');

        assert.strictEqual(result, 'output');
        assert.strictEqual(execSyncStub.calledOnce, true);
        const callArgs = execSyncStub.firstCall.args;
        assert.ok(callArgs[0].includes("XDEBUG_MODE=off"));
        assert.ok(callArgs[0].includes("bash -c"));
        assert.ok(callArgs[0].includes("'XDEBUG_MODE=off phpstan analyze'"));
    });

    test('execDdev escapes single quotes in command', () => {
        execSyncStub.returns('output');

        const result = DdevUtils.execDdev("echo 'hello'", '/test/workspace');

        assert.strictEqual(result, 'output');
        const callArgs = execSyncStub.firstCall.args;
        // Should be: ddev exec bash -c 'XDEBUG_MODE=off echo '\''hello'\'''
        assert.ok(callArgs[0].includes("'XDEBUG_MODE=off echo '\\''hello'\\'''"));
    });
});
