/**
 * Created by manerfan on 2017/1/17.
 */

const path = require('path');
const fs = require('fs');
const tempdir = require('os').tmpdir();

const gm = require('gm');
const Promise = require('bluebird');
const mkdirp = require('mkdirp');
const uuid = require('node-uuid');

const layout = require('./layout');

class Composite {
    constructor(pics = [], size = 60) {
        this.pics = pics;
        this.size = size;

        this.path = [];
        this.middlewares = [];
        this.bgColor = '#e3e3e3';
        this.border = this.size / 50;

        let sudokuNum = this.pics.length;
        sudokuNum = sudokuNum < 1 ? 1 : sudokuNum > 9 ? 9 : sudokuNum;
        this.sudoku = layout[sudokuNum - 1];
    }

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
        }).then((path) => that.path = path);
    }

    _use(fn) {
        this.middlewares.push(fn);
        return this;
    }

    _compose(callback = () => {
    }) {
        let len = this.middlewares.length;
        let next = callback;
        while (len--) {
            next = this._mnext(len, next);
        }
        return next;
    }

    _mnext(i, next) {
        let that = this;
        return (origin) => {
            that.middlewares[i].call(that, origin, next);
        }
    }

    _middlewares() {
        let that = this;

        that._use((origin, next) => {
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

        that.path.map((path, index) => {
            that._use((origin, next) => {
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

    composite(outdir, name, callback = () => {
    }) {
        let that = this;
        that._resizes(that.pics, that.size / that.sudoku.rate, outdir)
            .then(() => {
                that._middlewares()._compose((out) => callback(null, out))(path.join(outdir, name));
            })
            .catch((err) => console.error(err));
    }
}

module.exports = Composite;