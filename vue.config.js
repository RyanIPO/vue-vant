const webpackConfig = require('./config/webpack.config.js')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const isProd = process.env.NODE_ENV === 'production'
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// 开发模式代理地址 TODO: 按需修改
const DEV_URL = 'http://127.0.0.1'

// mock模式代理地址,为了方便演示，这里使用了fastmock线上服务，建议使用yapi,可以搭建私服， TODO: 按需修改
const MOCK_URL =
  'https://www.fastmock.site/mock/76e847c7f3aabd0bdd77d421d0f0757d/test'

module.exports = {
  configureWebpack: config => {
    if (isProd) {
      // 配置webpack 压缩
      config.plugins.push(
        new CompressionWebpackPlugin({
          test: /\.js$|\.html$|\.css$/,
          // 超过4kb压缩
          threshold: 4096
        })
      )
    }
  },
  chainWebpack: config => {
    // 项目标题
    config.plugin('html').tap(args => {
      args[0].title = 'vue-vant'
      return args
    })

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    webpackConfig(config)
  },
  // 不需要生产环境的 source map
  productionSourceMap: false,
  publicPath: !isProd ? '/' : '',
  css: {
    // 是否将css 提取到独立的文件,生产环境提取，开发环境不提取
    extract: !!isProd,
    // 开发模式开启css sourcemap
    sourceMap: !isProd,
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            hack: 'true;@import "~@/style/_variables.less"'
          }
        }
      }
    }
  },
  devServer: {
    port: 12315,
    proxy: {
      '^/api': {
        target: DEV_URL,
        changeOrigin: false,
        pathRewrite: {
          '^/api': ''
        }
      },
      '^/mock/': {
        // TODO: 添加 mock地址
        target: MOCK_URL,
        changeOrigin: false,
        pathRewrite: {
          '^/mock': ''
        }
      }
    }
  }
}
