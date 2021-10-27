import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image'
import visualizer from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import json from "@rollup/plugin-json";
import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';
import size from 'rollup-plugin-size';

const path = require('path');
const fs = require('fs');
console.log(`Current package location: ${path.join(process.cwd(), 'package.json')}`)
const pkg = require(path.join(process.cwd(), 'package.json'));

const extensions = [
    '.js', '.jsx'
];
const babelPresets = [
    ["@babel/env", { "modules": false }],
    "@babel/preset-react"
];
const tsconfigExists = fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json'));
if (!tsconfigExists) {
    babelPresets.push("@babel/typescript");
    extensions.push(".ts");
    extensions.push(".tsx");
    console.warn('No tsconfig.json available for package: ', process.cwd(), ', Using default babel presets: ', babelPresets);
}

let rollupExtConfig = null;
const rollupExtJSONPath = path.join(process.cwd(), 'rollup.ext.json')
if (fs.existsSync(rollupExtJSONPath)) {
    console.log(`Found rollup ext JSON: `, rollupExtJSONPath);
    rollupExtConfig = require(rollupExtJSONPath);
}

export default {
    input: './src/index.js',
    output: [{
        file: pkg.main,
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline')
    }, {
        file: pkg.module,
        format: 'es',
        inlineDynamicImports: true,
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline')
    },
    {
        file: pkg.amd,
        format: 'amd',
        inlineDynamicImports: true,
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline')
    },
    {
        file: pkg.jsdelivr,
        format: 'iife',
        inlineDynamicImports: true,
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline')
    }],
    plugins: [
        external(),
        postcss({
            extract: pkg.extract ? pkg.extract : false,
            minimize: true
        }),
        resolve({
            jsnext: true,
            extensions,
            exclude: /node_modules/,
        }),
        replace({
            exclude: /node_modules/,
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        commonjs({
            include: /node_modules/,
        }),
        (tsconfigExists && typescript({
            exclude: /node_modules/,
            clean: true,
            rollupCommonJSResolveHack: true,
            tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
            useTsconfigDeclarationDir: true,
        })),
        babel({
            extensions: extensions,
            exclude: /node_modules/,
            "presets": babelPresets,
            "plugins": [
                "@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread"
            ]
        }),
        json(),
        (process.env.NODE_ENV === 'production' && terser({
            parse: {
                // We want terser to parse ecma 8 code. However, we don't want it
                // to apply any minification steps that turns valid ecma 5 code
                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                // sections only apply transformations that are ecma 5 safe
                // https://github.com/facebook/create-react-app/pull/4234
                ecma: 8,
            },
            compress: {
                ecma: 5,
                warnings: false,
                // Disabled because of an issue with Uglify breaking seemingly valid code:
                // https://github.com/facebook/create-react-app/issues/2376
                // Pending further investigation:
                // https://github.com/mishoo/UglifyJS2/issues/2011
                comparisons: false,
                // Disabled because of an issue with Terser breaking valid code:
                // https://github.com/facebook/create-react-app/issues/5250
                // Pending further investigation:
                // https://github.com/terser-js/terser/issues/120
                inline: 2,
            },
            mangle: {
                safari10: true,
            },
            // Added for profiling in devtools
            keep_classnames: false,
            keep_fnames: false,
            output: {
                ecma: 5,
                comments: false,
                // Turned on because emoji and regex is not minified properly using default
                // https://github.com/facebook/create-react-app/issues/2488
                ascii_only: true,
            }
        })),
        image(),
        visualizer(),
        (rollupExtConfig && rollupExtConfig.copy && copy(rollupExtConfig.copy)),
        size()
    ],
    external: [].concat([
        'react',
        'react-native',
        'prop-types',
        'react-dom',
        'react-is',
        'xstate',
        'rx-lite',
        'classnames',
        'react-dom',
        'react-router-dom',
        '@itsy-ui/core',
        '@itsy-ui/utils',
        '@itsy-ui/navigation',
        '@itsy-ui/feedback',
        '@itsy-ui/form',
        '@itsy-ui/data',
        'axios',
        'formik',
        'yup'
    ], rollupExtConfig && rollupExtConfig.externals),
};
