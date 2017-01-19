/**
 * Created by manerfan on 2017/1/17.
 */

const Composite = require('./composite');
const Generator = require('./generator');

module.exports.composite = (pics, size, path, name, callback) => {
    new Composite(pics, size).composite(path, name, callback);
};

module.exports.generate = (out, size = 100) => {
    return new Generator(out, size).generate();
};