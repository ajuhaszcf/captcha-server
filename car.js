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
jobs.car1 = readCellDir('car1');
jobs.car1.instr = 'with a car in it';

function getWork(qs) {
  const root = qs.root || '';
  const taskToken = qs.tasktoken || _.sample(Object.keys(jobs));
  console.log(taskToken, root);
  const images = [];
  const theJob = jobs[taskToken];
  for (let i = 1; i <= 16; i += 1) {
    const address = _.compact([].concat(root, i)).join('.');
    images.push(theJob[address]);
  }
  return {
    task: theJob.instr || 'with a car in it',
    taskToken,
    images: [
      images.map(image => ({ id: image.id, src: image.name, selected: false })),
    ],
  };
}

function checkWork(body) {
  return true;
}

module.exports.getWork = getWork;
module.exports.checkWork = checkWork;
