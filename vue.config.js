module.exports = {
  devServer: {
    disableHostCheck: true,
    proxy: {
      "/api": { // 这个意思是：原先以 /api 开头的请求
        target: 'http://127.0.0.1:9121', // 凡是以 /api 开头的请求，通通请求这个服务器
        changeOrigin: true, // 允许跨域
        pathRewrite:{
          '^/api': ''  // 上面那个 /api 替换成这个(如果原来的请求中没有这个 /api，可以使用这个方法将以 /api 开头的这个去掉)
        }
      },
      "/image": { // 这个意思是：原先以 /api 开头的请求
        target: 'http://127.0.0.1:59002', // 凡是以 /api 开头的请求，通通请求这个服务器
        changeOrigin: true, // 允许跨域
        pathRewrite:{
          '^/image': '/download'  // 上面那个 /api 替换成这个(如果原来的请求中没有这个 /api，可以使用这个方法将以 /api 开头的这个去掉)
        }
      }
    }
  }
};
