import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  // Bản build của worker process (webpack.worker.config.js).
  { ignores: ['dist-worker/**'] },
];
