module.exports = {
  context: __dirname,

  entry: {
    index: './src/index.js',
  },

  output: {
    publicPath: '',
    path: './dist/build',
    filename: '[name].js',
    library: 'react-wrangler',
    libraryTarget: 'umd',
  },

  externals: {
    immutable: true,
    react: true,
    'react-immutable-proptypes': true,
  },

  debug: true,

  devtool: 'source-map',

  resolve: {
    root: __dirname,
    modulesDirectories: ['./src', 'node_modules'],
    extensions: ['', '.js'],
  },

  resolveLoader: {
    root: '.',
  },

  module: {
    exprContextCritical: false, // Removes warning about dynamic require()

    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel?cacheDirectory'],
      },
    ],
  },
};
