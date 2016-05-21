var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AppCachePlugin = require('appcache-webpack-plugin');

var plugins = [
    new webpack.optimize.CommonsChunkPlugin("vendor", "[hash].vendor.bundle.js"),
    new HtmlWebpackPlugin({ template: './src/www/index.ejs', inject: 'body' }),
    new AppCachePlugin(),
    new webpack.DefinePlugin({
        PORT: process.env.NODE_ENV === 'production' ? 443 : 8080,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));
}

function fontLoader(type) {
    return 'url?limit=65000000&mimetype=' + type + '&name=public/fonts/[name].[ext]';
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
            },
            { test: /\.svg$/, loader: fontLoader('image/svg+xml') },
            { test: /\.woff$/, loader: fontLoader('application/font-woff') },
            { test: /\.woff2$/, loader: fontLoader('application/font-woff2') },
            { test: /\.[ot]tf$/, loader: fontLoader('application/octet-stream') },
            { test: /\.eot$/, loader: fontLoader('application/vnd.ms-fontobject') }
        ]
    },
    plugins: plugins
};
