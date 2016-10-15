module.exports = {
  entry : __dirname + "/app/main.js",

  output : {
    path : __dirname + "/public",
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

      }
    ]
  },
  devServer : {
    contentBase : "./public",
    colors : true, //터미널 색상
    historyApiFallback : true,
    inline : true //페이지가 변경되여 새로 고침
//    port :8080
  }
};
