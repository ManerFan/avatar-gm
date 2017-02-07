/**
 * Created by manerfan on 2017/1/17.
 */

const Composite = require('./composite');
const Generator = require('./generator');

/**
 * 头像拼接
 * @param pics      需要拼接的头像
 * @param output    拼接头像输出
 * @param size      拼接头像大小
 */
module.exports.composite = (pics, output, size = 200) => {
    return new Composite(pics, size).composite(output);
};

/**
 * 头像生成
 * @param output    头像输出
 * @param size      头像大小
 */
module.exports.generate = (output, size = 200) => {
    return new Generator(output, size).generate();
};