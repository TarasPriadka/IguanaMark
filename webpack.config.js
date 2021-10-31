const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        popup: path.join(__dirname, "src/popup/popup.jsx"),
        content: path.join(__dirname, "src/content/content.jsx"),
        background: path.join(__dirname, "src/background/background.ts"),
    },
    output: {path: path.join(__dirname, "dist"), filename: "[name].js"},
    stats: {
        warningsFilter: [
            './node_modules'
        ]
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            resolve: {
                extensions: [".js", ".jsx"]
            },
            use: {
                loader: "babel-loader"
            }
        }, {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            resolve: {
                extensions: [".ts", ".tsx"]
            },
            use: {
                loader: "ts-loader"
            }
        },
            {
                test: /\.(css)?$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader"}
                ]
            }, {
                test: /\.svg$/,
                use: "file-loader",
            }, {
                test: /\.png$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            mimetype: "image/png",
                        },
                    },
                ],
            },
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [{from: "public", to: "."}],
        }),
        new CopyPlugin({
            patterns: [{from: "src/popup/popup.html", to: "."}],
        }),
        new CopyPlugin({
            patterns: [{from: "public/manifest.json", to: "."}],
        })
    ]
}