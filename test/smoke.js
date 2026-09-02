'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const PACKAGES_DIR = path.resolve(__dirname, '../packages');
const names = fs.readdirSync(PACKAGES_DIR).sort();

assert.ok(names.length > 0, 'no packages found');

function run(cmd, args, options) {
    const r = spawnSync(cmd, args, { encoding: 'utf8', ...options });
    if (r.error) throw r.error;
    return r;
}

for (const name of names) {
    const dir = path.join(PACKAGES_DIR, name);
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));

    assert.ok(!pkg.dependencies, `${name}: must not declare dependencies`);
    assert.ok(!pkg.scripts, `${name}: must not declare scripts`);

    const project = fs.mkdtempSync(path.join(os.tmpdir(), `${name}-`));
    fs.writeFileSync(
        path.join(project, 'package.json'),
        JSON.stringify({ name: 'placeholder-test-project', version: '1.0.0', private: true })
    );

    const packed = run('npm', ['pack', '--silent', '--pack-destination', project], { cwd: dir });
    assert.strictEqual(packed.status, 0, `${name}: npm pack failed\n${packed.stderr}`);

    const tarball = path.join(project, packed.stdout.trim());

    const listed = run('tar', ['-tzf', tarball]).stdout.split('\n');
    for (const required of ['package/README.md', 'package/LICENSE', `package/bin/${name}.js`]) {
        assert.ok(listed.includes(required), `${name}: ${required} is missing from the tarball`);
    }

    const installed = run(
        'npm',
        ['install', tarball, '--no-audit', '--no-fund', '--silent'],
        { cwd: project }
    );
    assert.strictEqual(installed.status, 0, `${name}: npm install failed\n${installed.stderr}`);

    const tree = fs
        .readdirSync(path.join(project, 'node_modules'))
        .filter((e) => !e.startsWith('.'));
    assert.deepStrictEqual(tree, [name], `${name}: install added more than the package itself`);

    const bin = path.join(project, 'node_modules', '.bin', name);
    assert.ok(fs.existsSync(bin), `${name}: no ${name} command in node_modules/.bin`);

    const r = run(bin, ['--some-flag'], { cwd: project });

    assert.strictEqual(r.status, 1, `${name}: expected exit 1, got ${r.status}`);

    assert.strictEqual(r.stdout, '', `${name}: stdout must stay empty`);
    assert.ok(r.stderr.includes('placeholder'), `${name}: notice must say it is a placeholder`);

    assert.ok(r.stderr.includes(name), `${name}: notice must name the command`);

    const docUrl = (r.stderr.match(/https:\/\/\S+/) || [])[0];
    assert.ok(docUrl, `${name}: notice must contain a documentation link`);

    const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
    assert.ok(readme.includes(docUrl), `${name}: README must link to the same page (${docUrl})`);

    const required = run(process.execPath, ['-e', `require(${JSON.stringify(name)})`], {
        cwd: project,
    });

    assert.strictEqual(required.status, 0, `${name}: require() must not kill the host process`);
    assert.ok(required.stderr.includes(docUrl), `${name}: require() must print the notice`);

    fs.rmSync(project, { recursive: true, force: true });

    process.stdout.write(`ok  ${name.padEnd(24)} ${docUrl}\n`);
}

process.stdout.write(`smoke: ${names.length} placeholder(s) verified\n`);
