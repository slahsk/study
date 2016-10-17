var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry : __dirname + "/app/main.js",
  devtool : 'dval-source-map',
  output : {
    path : __dirname + "/build",
    filename : "bundle.js"
  },
  module : {
    loaders : [
      {
        test:/\.json$/,
        loader : "json"
      },
      {
        test:/\.js$/,
        exclude : "/node_modules/",
        loader : "babel"

      },
      {
        test:/\.css$/,
        loader : 'style!css?modules!postcss'
      }
    ]
  },
  postcss:[
    require('autoprefixer')
  ],
  plugins : [
    new webpack.BannerPlugin("cacacapipipipi"),
    new HtmlWebpackPlugin({
      template : __dirname + "/app/index.tmpl.html"
    })
  ],
  devServer : {
    contentBase : "./public",
    colors : true, //터미널 색상
    historyApiFallback : true,
    inline : true //페이지가 변경되여 새로 고침
//    port :8080
  }
};
