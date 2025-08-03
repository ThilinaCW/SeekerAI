const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg|json|ttf|woff|woff2|eot)$/,
      threshold: 10240, // Only compress files larger than 10KB
      minRatio: 0.8, // Only compress if compression ratio is better than 0.8
    }),
  ],
};
