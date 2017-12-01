const fs = require('fs');
const _ = require('lodash');
const makeid = require('./idgen');

const floodedPhotos = fs.readdirSync(`${__dirname}/public/images/flooded`).map(filename => ({
  name: `images/flooded/${filename}`,
  id: `${makeid(10)}-${makeid(10)}-${makeid(10)}`,
}));
const floodingPhotos = fs.readdirSync(`${__dirname}/public/images/flooding`).map(filename => ({
  name: `images/flooding/${filename}`,
  id: `${makeid(10)}-${makeid(10)}-${makeid(10)}`,
}));
const notfloodedPhotos = fs.readdirSync(`${__dirname}/public/images/notflooded`).map(filename => ({
  name: `images/notflooded/${filename}`,
  id: `${makeid(10)}-${makeid(10)}-${makeid(10)}`,
}));

const goldFlooding = [].concat(floodingPhotos);
const negativeFlooding = [].concat(notfloodedPhotos);

function getWork() {
  const floodedSample = _.sampleSize(goldFlooding, 5);
  const notFloodedSample = _.sampleSize(negativeFlooding, 4);

  const aSample = _.shuffle([].concat(floodedSample, notFloodedSample));
  return {
    task: 'with flooded areas',
    taskToken: Math.round(Math.random() * 1000000).toString(),
    images: aSample.map(image => ({ id: image.id, src: image.name, selected: false })),
  };
}

function checkWork(body) {
  const images = body.images;
  // console.log(req.body.images);
  const goldIds = goldFlooding.map(element => element.id);
  const negIds = negativeFlooding.map(element => element.id);

  const gold = images
    .filter(image => goldIds.indexOf(image.id) !== -1)
    .reduce((acc, image) => acc && image.selected, true);
  const negative = !images
    .filter(image => negIds.indexOf(image.id) !== -1)
    .reduce((acc, image) => acc || image.selected, false);

  return gold && negative;
}

module.exports.getWork = getWork;
module.exports.checkWork = checkWork;
