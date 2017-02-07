/**
 * Created by manerfan on 2017/1/17.
 */

const path = require('path');
const fs = require('fs');
const tempdir = require('os').tmpdir();

const gm = require('gm');
const request = require('request');
const Promise = require('bluebird');
const mkdirp = require('mkdirp');
const uuid = require('node-uuid');

const layout = require('./layout');

class Composite {
    /**
     * 头像拼接
     * @param pics 需要拼接的头像
     * @param size 输出尺寸
     */
    constructor(pics = [], size = 200) {
        this.pics = pics;
        this.size = size;

        this.middlewares = [];
        this.border = this.size / 50;

        let sudokuNum = this.pics.length;
        sudokuNum = sudokuNum < 1 ? 1 : sudokuNum > 9 ? 9 : sudokuNum;
        this.sudoku = layout[sudokuNum - 1]; // 根据头像数量选择布局
    }

    /**
     * 生成空白头像
     */
    _empty_pic(size, path, resolve, reject) {
        gm(size, size, this.bgColor).write(path, (err) => {
            if (!!err) {
                reject(err);
            } else {
                resolve(path);
            }
        });
    }

    _resize(pic, size, path) {
        let that = this;
        return new Promise((resolve, reject) => {
            let _size = size - 2 * this.border;

            if (that.isWebAssert(pic)) {
                pic = request(pic);
            }

            gm(pic)
                .resize(_size, _size, '!')
                .borderColor(that.bgColor)
                .border(that.border, that.border)
                .write(path, (err) => {
                    if (!!err) {
                        reject(err);
                        that._empty_pic(size, path, resolve, reject);
                    } else {
                        resolve(path);
                    }
                })
        });
    }

    _resizes(pics, size, dir) {
        let that = this;
        return Promise.map(pics, (pic, index) => {
            return that._resize(pic, size, path.join(dir, `${index}.png`));
        });
    }

    _use(fn) {
        this.middlewares.push(fn);
        return this;
    }

    _makeDir(output) {
        return new Promise((resolve, reject) => {
            if (!output) {
                output = path.join(tempdir, `${uuid.v1()}.png`);
            }

            if (path.extname(output).length < 1) {
                output = path.join(output, `${uuid.v1()}.png`)
            }

            mkdirp(path.dirname(output), (err) => {
                let _output = output;

                if (!!err) {
                    console.error(err);
                    _output = path.join(tempdir, `${uuid.v1()}.png`);
                }

                resolve(_output);
            })
        });
    }

    /**
     * 构造执行链
     */
    _compose() {
        let that = this;

        return Promise.coroutine(function*(output) {
            // 生成目标目录
            let _output = yield that._makeDir(output);
            // 调整头像大小
            let pics = yield that._resizes(that.pics, that.size / that.sudoku.rate, path.dirname(_output));
            // 构造中间件
            that._middlewares(pics);

            // 执行中间件
            let out = _output, fn;
            while (!!(fn = that.middlewares.shift())) {
                out = yield fn(out);
            }

            return out;
        });
    }

    _middlewares(pics) {
        let that = this;
        this.middlewares = [];

        // 生成底图
        that._use((origin) => {
            return new Promise((resolve, reject) => {
                gm(that.size, that.size, that.bgColor)
                    .write(origin, (err) => {
                        if (!!err) {
                            reject(err);
                        } else {
                            resolve(origin);
                        }
                    });
            });
        });

        // 将头像依次叠加到底图上
        pics.map((path, index) => {
            that._use((origin) => {
                return new Promise((resolve, reject) => {
                    gm(origin)
                        .composite(path).geometry(`+${that.size * that.sudoku.layout[index].x}+${that.size * that.sudoku.layout[index].y}`)
                        .write(origin, (err) => {
                            fs.unlink(path, (err) => {
                                if (!!err) {
                                    console.error(err);
                                }
                            });

                            if (!!err) {
                                reject(err);
                            } else {
                                resolve(origin);
                            }
                        });
                });
            });
        });

        return that;
    }

    /**
     * 拼接头像
     */
    composite(output) {
        if (!output) {
            output = path.join(tempdir, `${uuid.v1()}.png`);
        }

        let compose = this._compose();

        return compose(output);
    }
}

// 背景颜色
Composite.prototype.bgColor = '#e3e3e3';
// 判断是否为网络资源
Composite.prototype.isWebAssert = (assert) => {
    return /^((http(s)?|ftp):\/\/)/i.test(assert);
};

module.exports = Composite;
