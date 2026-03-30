/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    reject: [
        // we'll upgrade Node manually when it's time
        '@types/node',

        // it takes time for the ecosystem to catch up
        "typescript",

        // many icons removed
        "lucide-react",

        // Turbo ships codemods to upgrade, so leave it alone
        "turbo"
    ],

    packageManager: 'pnpm',

    // use workspaces mode
    workspaces: true
};
