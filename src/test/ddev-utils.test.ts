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
import * as fs from 'fs';

suite('DdevUtils Test Suite', () => {
    let sandbox: sinon.SinonSandbox;
    let spawnSyncStub: sinon.SinonStub;
    let existsSyncStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Use require to get the module to ensure we can stub it
        const cp = require('child_process');
        const fs = require('fs');

        // Try to stub, but handle if it fails (basic check)
        try {
            spawnSyncStub = sandbox.stub(cp, 'spawnSync');
            existsSyncStub = sandbox.stub(fs, 'existsSync');
        } catch (e) {
            console.error('Failed to stub modules:', e);
            throw e;
        }
    });

    afterEach(() => {
        sandbox.restore();
    });

    test('hasDdevProject returns true when .ddev/config.yaml exists', () => {
        existsSyncStub.returns(true);

        const result = DdevUtils.hasDdevProject('/test/workspace');

        assert.strictEqual(result, true);
        assert.strictEqual(existsSyncStub.calledOnce, true);
    });

    test('hasDdevProject returns false when .ddev/config.yaml does not exist', () => {
        existsSyncStub.returns(false);

        const result = DdevUtils.hasDdevProject('/test/workspace');

        assert.strictEqual(result, false);
    });

    test('isDdevRunning returns true when DDEV container is running', () => {
        spawnSyncStub.returns({ status: 0, stdout: 'test\n' });

        const result = DdevUtils.isDdevRunning('/test/workspace');

        assert.strictEqual(result, true);
    });

    test('isDdevRunning returns false when DDEV container is not running', () => {
        spawnSyncStub.returns({ status: 1, stderr: 'Container not running' });

        const result = DdevUtils.isDdevRunning('/test/workspace');

        assert.strictEqual(result, false);
    });

    test('isToolInstalled returns true when tool is available', () => {
        spawnSyncStub.returns({ status: 0, stdout: 'PHPStan 1.10.0\n' });

        const result = DdevUtils.isToolInstalled('phpstan', '/test/workspace');

        assert.strictEqual(result, true);
    });

    test('isToolInstalled returns false when tool is not available', () => {
        spawnSyncStub.returns({ status: 1, stderr: 'Command not found' });

        const result = DdevUtils.isToolInstalled('phpstan', '/test/workspace');

        assert.strictEqual(result, false);
    });

    test('validateDdevTool returns invalid result when no DDEV project found', () => {
        existsSyncStub.returns(false);

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.errorType, 'no-ddev-project');
        assert.strictEqual(result.userMessage, 'No DDEV project found');
    });

    test('validateDdevTool returns valid result when tool is available', () => {
        // hasDdevProject
        existsSyncStub.returns(true);
        // execDdev (tool check)
        spawnSyncStub.returns({ status: 0, stdout: 'PHPStan 1.10.0\n' });

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, true);
        assert.strictEqual(result.errorType, undefined);
    });

    test('validateDdevTool returns error message for DDEV issues', () => {
        // hasDdevProject
        existsSyncStub.returns(true);
        // execDdev (tool check) fails
        spawnSyncStub.onFirstCall().returns({ status: 1, stderr: 'Container not running' });
        // isDdevRunning fails
        spawnSyncStub.onSecondCall().returns({ status: 1, stderr: 'DDEV not running' });

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.errorType, 'ddev-not-running');
        assert.ok(result.userMessage?.includes('appears to be stopped'));
    });

    test('validateDdevTool returns tool not found message when tool is missing', () => {
        // hasDdevProject
        existsSyncStub.returns(true);
        // execDdev (tool check) fails
        spawnSyncStub.onFirstCall().returns({ status: 127, stderr: 'Command not found' });
        // isDdevRunning succeeds
        spawnSyncStub.onSecondCall().returns({ status: 0, stdout: 'test\n' });

        const result = DdevUtils.validateDdevTool('phpstan', '/test/workspace');

        assert.strictEqual(result.isValid, false);
        assert.strictEqual(result.errorType, 'tool-not-found');
        assert.ok(result.userMessage?.includes('phpstan is not installed'));
        assert.ok(result.userMessage?.includes('phpstan/phpstan'));
    });

    test('execDdev passes args array correctly', () => {
        spawnSyncStub.returns({ status: 0, stdout: 'output' });

        const result = DdevUtils.execDdev(['phpstan', 'analyze'], '/test/workspace');

        assert.strictEqual(result, 'output');
        assert.strictEqual(spawnSyncStub.calledOnce, true);
        const callArgs = spawnSyncStub.firstCall.args;
        assert.strictEqual(callArgs[0], 'ddev');
        assert.deepStrictEqual(callArgs[1], ['exec', 'env', 'XDEBUG_MODE=off', 'phpstan', 'analyze']);
        assert.strictEqual(callArgs[2].cwd, '/test/workspace');
    });

    test('execDdev throws on non-zero exit code', () => {
        spawnSyncStub.returns({ status: 1, stderr: 'error', stdout: '' });

        assert.throws(() => {
            DdevUtils.execDdev(['ls'], '/test/workspace');
        }, (err: any) => {
            return err.status === 1 && err.stderr === 'error';
        });
    });

    test('execDdev returns stdout on allowed non-zero exit code', () => {
        spawnSyncStub.returns({ status: 1, stdout: 'partial output' });

        const result = DdevUtils.execDdev(['ls'], '/test/workspace', [0, 1]);

        assert.strictEqual(result, 'partial output');
    });
});

