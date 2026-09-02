#!/usr/bin/env node
'use strict';

process.stderr.write([
    '',
    'This is a placeholder package published by Developer Express Inc.',
    'The devextreme-license CLI tool is distributed as part of the DevExtreme package.',
    '',
    'Run the following command to use devextreme-license without installation:',
    '',
    '    npx --package devextreme devextreme-license',
    '',
    'Alternatively, install DevExtreme and run the CLI tool from global installation:',
    '',
    '    npm install --global devextreme',
    '    devextreme-license',
    '',
    'If you installed this package, remove it to ensure devextreme-license works',
    'as expected:',
    '',
    '    npm uninstall devextreme-license',
    '    -- or --',
    '    pnpm remove devextreme-license',
    '',
    'https://docs.devexpress.com/GeneralInformation/405494/trial-register/set-up-your-dev-express-license-key',
    '',
].join('\n') + '\n');

if (require.main === module) {
    process.exit(1);
}
