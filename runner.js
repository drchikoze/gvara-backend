require('babel-register')({
   presets: [ 'es2015', 'node7' ],
   plugins: [
       'add-module-exports',
       'transform-class-properties',
       'transform-decorators',
       'transform-object-rest-spread',
       'transform-runtime',
       'transform-async-to-generator',
       'transform-function-bind'
   ]
});
require('./app.js');
