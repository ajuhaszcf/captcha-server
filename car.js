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

const status = {};
for (let x = 0; x < 64; x += 1) {
  for (let y = 0; y < 64; y += 1) {
    status[`${x},${y}`] = {
      large: false,
      medium: false,
      small: false,
    };
  }
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
    root,
    images: [
      images.map(image => ({
        id: image.id,
        src: image.name,
        selected: false,
        match: image.match,
      })),
    ],
  };
}

function checkWork(body) {
  console.log(body);
  const selected = body.images[0].filter(im => im.selected);
  console.log(selected);
  selected.forEach((pixel) => {
    const root = pixel.match.length;
    const coords = [{
      x: Math.floor((pixel.match[0] - 1) % 4) * Math.pow(4, 2),
      y: Math.floor((pixel.match[0] - 1) / 4) * Math.pow(4, 2),
      w: Math.pow(4, 2),
      h: Math.pow(4, 2),
    }];

    for (let i = 1; i < root; i += 1) {
      const level = pixel.match[i];
      const pix = {
        x: coords[i-1].x + Math.floor((level - 1) % 4) * Math.pow(4, 2 - i),
        y: coords[i-1].y + Math.floor((level - 1) / 4) * Math.pow(4, 2 - i),
        w: Math.pow(4, (2 - i)),
        h: Math.pow(4, (2 - i)),
      };
      console.log(level, i)
      coords.push(pix);
    }
    console.log(coords);
    const current = coords.splice(-1)[0];
    console.log(coords);
    console.log(current);
    for (let x = current.x; x < current.x + current.w; x += 1) {
      for (let y = current.y; y < current.y + current.h; y += 1) {
        switch (root) {
          case 1:
            status[`${x},${y}`].large = true;
            break;
          case 2:
            status[`${x},${y}`].medium = true;
            break;
          case 3:
            status[`${x},${y}`].small = true;
            break;

          default:
        }
        
      }
    }
  });
  return true;
}

function getStatus() {
  const arr = [];
  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      const pixel = status[`${x},${y}`];
      const score = (pixel.large ? 0.1 : 0) + (pixel.medium ? 0.3 : 0) + (pixel.small ? 1 : 0);
      arr.push(score);
    }
  }
  return arr;
}

module.exports.getWork = getWork;
module.exports.checkWork = checkWork;
module.exports.getStatus = getStatus;
