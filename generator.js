/**
 * Created by manerfan on 2017/1/18.
 */

const path = require('path');
const fs = require('fs');
const tempdir = require('os').tmpdir();

const gm = require('gm');
const Promise = require('bluebird');
const mkdirp = require('mkdirp');
const uuid = require('node-uuid');

class Generate {
    constructor(output, size = 200) {
        this.output = output;
        this.size = size;

        if (!this.output) {
            this.output = path.join(tempdir, `${uuid.v1()}.png`);
        }

        if (path.extname(this.output).length < 1) {
            this.output = path.join(this.output, `${uuid.v1()}.png`)
        }
    }

    _random() {
        return (Math.random() * 10 - 5) < 0;
    }

    _randomLayoutRow() {
        let row = [];
        for (let j = 0; j < 3; j++) {
            row.push(this._random());
        }

        return row;
    }

    _randomLayout() {
        let layout = [];
        for (let j = 0; j < 5; j++) {
            layout.push(this._randomLayoutRow());
        }

        return layout;
    };

    _layout() {
        let layout = this._randomLayout();
        for (let i = 0; i < 5; i++) {
            for (let j = 3; j < 5; j++) {
                layout[i][j] = layout[i][4 - j];
            }
        }

        return layout;
    }

    _color() {
        return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
    }

    generate() {
        let that = this;

        return new Promise((resolve, reject) => {
            let layout = this._layout();
            let color = this._color();

            let avatar = gm(this._subSize * 5, this._subSize * 5, this.bgColor).fill(color);
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (!layout[i][j]) continue;
                    avatar.drawRectangle(j * this._subSize, i * this._subSize, (j + 1) * this._subSize, (i + 1) * this._subSize);
                }
            }

            avatar.borderColor(this.bgColor).border(this._border, this._border);
            avatar.resize(this.size, this.size, '!');

            mkdirp(path.dirname(this.output), (err) => {
                if (!!err) {
                    console.error(err);
                    this.output = path.join(tempdir, `${uuid.v1()}.png`);
                }

                avatar.write(that.output, (err) => {
                    if (!!err) {
                        reject(err);
                    } else {
                        resolve(that.output);
                    }
                })
            });
        });
    }
}

Generate.prototype.bgColor = '#e3e3e3';
Generate.prototype._subSize = 40;
Generate.prototype._border = 5;

module.exports = Generate;
