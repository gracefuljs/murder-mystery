const path = require('path');

module.exports = {
	mode: 'development',
    entry: './src/js/main.js',
    output: {
	    filename: 'index.js',
	    path: path.resolve(__dirname, 'dist'),
	    publicPath: '/',
  	},
    
    devtool: 'inline-source-map',
    devServer: {
    	contentBase: './dist',
    	publicPath: '/',
    	port:8080,
    },

};