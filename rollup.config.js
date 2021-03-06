import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import typescript from "@rollup/plugin-typescript";
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import json from "@rollup/plugin-json";
import pkg from './package.json';
import alias from '@rollup/plugin-alias';
const { preprocess } = require("./svelte.config.js");

import configFile from "./sirix-config";

const tauriMode = !!process.env["TAURI"];

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const sourcemap = dev ? "inline" : false;
const legacy = !!process.env.SAPPER_LEGACY_BUILD;
const demoDeploy = !!process.env["DEMO"];

const onwarn = (warning, onwarn) =>
  (warning.code === 'MISSING_EXPORT' && /'preload'/.test(warning.message)) ||
  (warning.code === 'CIRCULAR_DEPENDENCY') || onwarn(warning);


const replaceObj = {
  'process.browser': true,
  'process.tauri': tauriMode,
  'process.env.NODE_ENV': JSON.stringify(mode),
  'process.config.sirixUri': dev ? `'${configFile.dev.sirixUri}'` : demoDeploy ? `'${configFile.demo.sirixUri}'` : `''`,
  'process.config.username': dev ? `'${configFile.dev.username}'` : demoDeploy ? `'${configFile.demo.password}'` : `''`,
  'process.config.password': dev ? `'${configFile.dev.password}'` : demoDeploy ? `'${configFile.demo.password}'` : `''`,
};

export default {
  client: {
    input: config.client.input(),
    output: config.client.output(),
    plugins: [
      replace(replaceObj),
      alias({
        entries: [
          { find: '@componentLibrary', replacement: 'src/components/componentLibrary' }
        ]
      }),
      svelte({
        preprocess,
        compilerOptions: {
          dev,
          hydratable: true,
        },
        emitCss: true
      }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      typescript({
        noEmitOnError: !dev,
        sourceMap: !!sourcemap,
        tsconfig: "./tsconfig.json",
      }),
      json(),
      commonjs(),

      (legacy) && babel({
        extensions: ['.js', '.ts', '.mjs', '.html', '.svelte'],
        runtimeHelpers: true,
        exclude: ['node_modules/@babel/**'],
        presets: [
          ['@babel/preset-env', {
            targets: '> 0.25%, not dead'
          }]
        ],
        plugins: [
          '@babel/plugin-syntax-dynamic-import',
          "@babel/plugin-proposal-object-rest-spread",
          ['@babel/plugin-transform-runtime', {
            useESModules: true
          }]
        ]
      }),

      !dev && terser({
        module: true
      })
    ],
    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: config.server.input(),
    output: config.server.output(),
    plugins: [
      replace({ ...replaceObj, 'process.browser': false }),
      alias({
        entries: [
          { find: '@componentLibrary', replacement: 'src/components/componentLibrary' }
        ]
      }),
      svelte({
        preprocess,
        compilerOptions: {
          generate: 'ssr',
          dev,
        },
      }),
      resolve({
        dedupe: ['svelte']
      }),
      typescript({
        noEmitOnError: !dev,
        sourceMap: !!sourcemap,
        tsconfig: "./tsconfig.json"
      }),
      json(),
      commonjs()
    ],
    external: Object.keys(pkg.dependencies).concat(
      require('module').builtinModules || Object.keys(process.binding('natives'))
    ),
    preserveEntrySignatures: 'strict',
    onwarn,
  },

  serviceworker: {
    input: config.serviceworker.input(),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      commonjs(),
      !dev && terser()
    ],

    onwarn,
  }
};