import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import pkg from './package.json'

export default {
  input: 'index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false,
    },
  ],
  plugins: [typescript({sourceMap: true}), nodeResolve()],
  external: ['react', 'react-dom', 'zustand'],
}