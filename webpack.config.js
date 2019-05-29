const path=require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    entry: "./src/index.js",
    output: {
        // publicPath: './',
        path: path.join(__dirname,'dist'),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.pug$/,
                use: [
                // {
                //     loader: HtmlWebpackPlugin.loader
                // },
                  'html-loader',
                  // 'raw-loader',
                  {
                    loader: 'pug-html-loader',
                    // options: {
                    //   data: { aa: 2222 } // set of data to pass to the pug render.
                    // }
                  }]
              },
            //for babel 7
            {
                use: {
                    loader: 'babel-loader'
                },
                test: /\.js$/,
                exclude: /node_modules/
            },
            //for css import to js
            {
                test: /\.(scss|css)$/,
                use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                            publicPath: '../'
                            }
                        },
                        {
                            loader: "css-loader",
                            options:{
                                importLoaders:2 ,
                                modules: true 
                            }
                        }, 
                    'sass-loader',
                    {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [require('autoprefixer')]
                        }
                    }
                ]
            },
            //for img
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                          limit: 8 * 1024,
                          name: `assets/img/[name].[ext]`,
                        }
                    },
                    // {
                    //     loader:'html-loader',
                    //     options:{
                    //         attrs:['img:src','img:data-src'] //<\img src=”src/assets/img/demo.png” data-src=”src/assets/img/demo1.png” />
                    //     }
                    // }
                ]
            
            },
            //for font
            {
                test: /\.(eot|woff2?|ttf|svg)$/,
                use: [
                {
                    loader: 'url-loader',
                    options: {
                    name: '[name]-[hash:5].min.[ext]',
                    limit: 5000, 
                    publicPath: '../fonts/',
                    outputPath: 'fonts/'
                    }
                }
                ]
            }
        ]
    },
    devtool: "cheap-module-eval-source-map",
    devServer: {
        contentBase: path.join(__dirname,'build'),
        port: 3002
    },
    plugins: [
        new HtmlWebpackPlugin({
            minify: {
                removeComments: true,
                collapseWhitespace: true, 
                minifyCSS: true
            },
            template: 'src/index.pug' 
        }),
        new CleanWebpackPlugin(), //DEFAULT DIR DIST
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css'
            }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'), 
            cssProcessorOptions: { safe: true, discardComments: { removeAll: true } }, 
            canPrint: true 
        })
    ]
}