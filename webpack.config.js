const path = require( 'path' )
const webpack = require( 'webpack' )
const { webpackHelper } = require( '@venkatperi/webpack-helper' )
const pkg = require( './package.json' )

const cwd = __dirname

const modules = {
  mode: true,
  vue: true,
  ts: true,
  miniExtractCss: true,
  optimizeCss: true,
  style: true,
  img: true,
  ext: true,
  devServer: true,
  misc: true,
  dev: { args: { name: '[name].umd.js' } },
  copy: { args: [[{ from: 'index.html' }]] },
  prod: true,
}
const variants = [
  'umd',
]

module.exports = webpackHelper( {
  variants, modules, cwd, webpack,
}, ( config ) => {
  config
    .entry( pkg.name )
    .add( './src/main.ts' )

  config.baseUrl = '/dist'

  config.output
    .path( path.resolve( __dirname, './dist' ) );
} )

