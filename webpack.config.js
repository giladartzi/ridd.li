var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AppCachePlugin = require('appcache-webpack-plugin');

var plugins = [
    new webpack.optimize.CommonsChunkPlugin("vendor", "[hash].vendor.bundle.js"),
    new HtmlWebpackPlugin({ template: './src/www/index.ejs', inject: 'body' }),
    new AppCachePlugin(),
    new webpack.DefinePlugin({
        PORT: process.env.NODE_ENV === 'production' ? 80 : 8080,
        'process.env.NODE_ENV': process.env.NODE_ENV
    })
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));
}

module.exports = {
    entry: {
        app: './src/www/index.js',
        vendor: ['react', 'react-redux', 'react-dom']
    },
    output: {
        path: './public/',
        filename: "[hash].bundle.js"
    },
    devtool: 'source-map',
    devServer: {
        inline: true,
        contentBase: './public/',
        port: 3000,
        historyApiFallback: true
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-1', 'react']
                }
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    },
    plugins: plugins
};