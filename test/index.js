/**
 * Created by manerfan on 2017/1/17.
 */

const fs = require('fs');
const path = require('path');

const Promise = require('bluebird');

const {composite, generate} = require('../');
//const composite = Promise.promisify(require('../').composite);

// let pics = fs.readdirSync(path.join(__dirname, 'assets'));
// pics = pics.map((pic) => {
//     return path.join(__dirname, 'assets', pic);
// });
//
// Promise.mapSeries(pics, (pic, index) => {
//     return composite(pics.slice(0, index + 1), 200, __dirname, `out${index + 1}.png`);
// });

Promise.map([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (i) => {
    generate(path.join(__dirname, 'generate', `${i}.png`)).then((out) => console.log(out));
});
