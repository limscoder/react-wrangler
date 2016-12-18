module.exports = {
  context: __dirname,

  entry: {
    index: './examples/counter/App.js',
    html: './examples/counter/index.html',
  },

  output: {
    publicPath: '',
    path: './dist/examples/counter',
    filename: '[name].js',
    library: 'Counter',
    libraryTarget: 'var',
  },

  debug: true,

  devtool: 'source-map',

  devServer: {
    hot: true,
    inline: true,
    contentBase: './dist/examples/counter',
    keepalive: true,
    port: 9000,
    host: 'localhost',
    stats: 'errors-only',
  },

  resolve: {
    root: __dirname,
    modulesDirectories: ['./examples/counter', 'node_modules'],
    extensions: ['', '.js', '.html'],
  },

  resolveLoader: {
    root: '.',
  },

  module: {
    exprContextCritical: false, // Removes warning about dynamic require()

    loaders: [
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel?cacheDirectory'],
      },
    ],
  },
};
