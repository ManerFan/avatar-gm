/**
 * Created by manerfan on 2017/1/17.
 */

const fs = require('fs');
const path = require('path');

const Promise = require('bluebird');

const {composite, generate} = require('../');

_print = (output) => console.info(output);

let pics = fs.readdirSync(path.join(__dirname, 'assets'));
pics = pics.map((pic) => {
    return path.join(__dirname, 'assets', pic);
});

Promise.mapSeries(pics, (pic, index) => {
    return composite(pics.slice(0, index + 1), path.join(__dirname, 'composite', `composite${index + 1}.png`));
}).then(_print);

generate().then(_print);
generate(path.join(__dirname, "generate")).then(_print);
generate(path.join(__dirname, "generate/avatar.jpg")).then(_print);
