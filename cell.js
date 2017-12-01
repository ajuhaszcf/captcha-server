const fs = require('fs');
const _ = require('lodash');
const makeid = require('./idgen');

const cell1 = fs.readdirSync(`${__dirname}/public/images/cell1`).filter(e => /.png$/.test(e)).map(e => ({
  match: e.match(/(\d+)/g),
  name: `/images/cell1/${e}`,
  id: `${makeid(10)}-${makeid(10)}-${makeid(10)}`,
}));

const cell1Job = {};
cell1.forEach((e) => {
  const address = e.match.join('.');
  cell1Job[address] = e;
});
// console.log(cell1Job);

function getWork(qs) {
  const root = qs.root || '';
  const images = [];
  for (let i = 1; i <= 16; i += 1) {
    const address = _.compact([].concat(root, i)).join('.');
    images.push(cell1Job[address]);
  }
  return {
    task: 'where cells touch each other',
    taskToken: root,
    images: images.map(image => ({ id: image.id, src: image.name, selected: false })),
  };
}

function checkWork(images) {
  return true;
}

module.exports.getWork = getWork;
module.exports.checkWork = checkWork;
