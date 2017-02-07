/**
 * Created by manerfan on 2017/1/17.
 */

const Composite = require('./composite');
const Generator = require('./generator');

module.exports.composite = (pics, output, size = 200) => {
    return new Composite(pics, size).composite(output);
};

module.exports.generate = (output, size = 200) => {
    return new Generator(output, size).generate();
};