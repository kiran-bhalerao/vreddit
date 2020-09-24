const { ChakraLoaderPlugin } = require('chakra-loader')

module.exports = {
  pluginOptions: {
    apollo: {
      lintGQL: true
    }
  },
  configureWebpack: {
    plugins: [new ChakraLoaderPlugin()]
  }
}
