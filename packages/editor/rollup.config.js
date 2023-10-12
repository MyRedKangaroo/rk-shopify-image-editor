import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { visualizer } from 'rollup-plugin-visualizer';
import sourcemaps from 'rollup-plugin-sourcemaps';
import eslint from '@rollup/plugin-eslint';
import { uglify } from 'rollup-plugin-uglify';

export default {
    input: 'src/index.ts',
    output: {
        format: 'esm',
        file: 'dist/index.js',
        sourcemap: false,
    },
    plugins: [
        resolve(),
        commonjs(),
        eslint({ throwOnError: true }),
        uglify(),
        sourcemaps(),
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
