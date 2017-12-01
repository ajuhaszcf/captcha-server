const fs = require('fs');
const _ = require('lodash');
const makeid = require('./idgen');

function readCellDir(dir) {
  const cell1 = fs.readdirSync(`${__dirname}/public/images/${dir}`).filter(e => /.png$/.test(e)).map(e => ({
    match: e.match(/(\d+)/g).reverse(),
    name: `images/${dir}/${e}`,
    id: `${makeid(10)}-${makeid(10)}-${makeid(10)}`,
  }));

  const cellJob = {};
  cell1.forEach((e) => {
    const address = e.match.join('.');
    cellJob[address] = e;
  });
  return cellJob;
}

const jobs = {};
jobs.cell1 = readCellDir('cell1');
jobs.cell2 = readCellDir('cell2');

// console.log(cell1Job);

function getWork(qs) {
  const root = qs.root || '';
  const taskToken = qs.tasktoken || 'cell1';
  const images = [];
  for (let i = 1; i <= 16; i += 1) {
    const address = _.compact([].concat(root, i)).join('.');
    console.log(jobs[taskToken][address]);
    images.push(jobs[taskToken][address]);
  }
  return {
    task: 'where cells touch each other',
    taskToken,
    images: images.map(image => ({ id: image.id, src: image.name, selected: false })),
  };
}

function checkWork(images) {
  return true;
}

module.exports.getWork = getWork;
module.exports.checkWork = checkWork;