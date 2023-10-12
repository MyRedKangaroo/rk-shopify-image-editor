import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import multiInput from 'rollup-plugin-multi-input';
import { visualizer } from 'rollup-plugin-visualizer';
import eslint from '@rollup/plugin-eslint';

export default {
    input: [
        'src/index.ts',
        'src/color/index.ts',
        'src/data/index.ts',
        'src/event/index.ts',
        'src/keyboard/index.ts',
        'src/network/index.ts',
        'src/object/index.ts',
    ],
    output: {
        format: 'esm',
        dir: 'dist',
    },
    plugins: [
        multiInput({ relative: 'src/' }),
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
