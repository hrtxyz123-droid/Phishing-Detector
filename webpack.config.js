const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production', // Minifies code for professional performance
  entry: {
    background: './background.js',
    popup: './popup.js',
    content: './content.js',
    phishing: './phishing.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true // Clears the dist folder before every new build
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Optional: improves cross-browser compatibility
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "manifest.json" },
        { from: "popup.html", to: "popup.html" },
        { from: "styles.css", to: "styles.css" },
        { from: "icons", to: "icons" },
        // Important: Copies your AI model so the extension can find it
        { from: "ml-model/model.json", to: "ml-model/model.json" },
        //{ from: "ml-model/*.bin", to: "ml-model/[name][ext]" }
      ],
    }),
  ],
};