import { Config } from 'bili';

const config: Config = {
  input: 'src/index.ts',
  output: {
    format: ['cjs', 'esm'],
    minify: false,
    sourceMap: true,
  },
  plugins: {
    // rollup-plugin-typescript2's default include ('*.ts+(|x)') matches nothing with picomatch >= 2.3.2
    typescript2: {
      include: ['**/*.ts', '**/*.tsx'],
    },
  },
};

export default config;
