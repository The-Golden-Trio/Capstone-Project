const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [
        './src/assets',
        // Data build từ occupation-data/scripts/build_skill_taxonomy.py + build_role_graph.py
        // → dist/assets/data/*.json, load lúc bootstrap (xem shared/paths.ts resolveDataDir).
        {
          input: 'occupation-data/generated',
          glob: '{skills_taxonomy,role_graph}.json',
          output: 'assets/data',
        },
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};
