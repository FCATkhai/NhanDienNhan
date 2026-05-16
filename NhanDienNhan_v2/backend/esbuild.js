const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: true,
    packages: 'external',
    format: 'cjs', // CommonJS format
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    logLevel: 'info',
}).catch(() => process.exit(1));
