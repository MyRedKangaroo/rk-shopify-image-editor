import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';
import eslint from '@rollup/plugin-eslint';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: false,
    },
    plugins: [
        resolve(),
        eslint({ throwOnError: true }),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            exclude: '../../node_modules/**',
        }),
        peerDepsExternal(),
        typescript({
            tsconfig: '../../tsconfig.json',
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                    paths: {
                        '@lidojs/*': ['packages/*/src'],
                    },
                },
                include: null,
            },
        }),
        visualizer(),
    ],
};
