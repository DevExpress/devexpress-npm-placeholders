#!/usr/bin/env node
'use strict';

process.stderr.write([
    '',
    'This is a placeholder package published by Developer Express Inc.',
    'Install the DevExtreme package to use devextreme-bundler-init in your project.',
    '',
    'https://js.devexpress.com/jQuery/Documentation/Guide/Common/Modularity/Create_a_Custom_Bundle/',
    '',
    'If you installed this package, remove it to ensure devextreme-bundler-init works',
    'as expected:',
    '',
    '    npm uninstall devextreme-bundler-init',
    '    -- or --',
    '    pnpm remove devextreme-bundler-init',
    '',
].join('\n') + '\n');

if (require.main === module) {
    process.exit(1);
}
