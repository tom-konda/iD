/* eslint-disable no-console */
import chalk from 'chalk';
import concat from 'concat-files';
import { glob } from 'glob';
import fs from 'node:fs';
import postcss from 'postcss';
import prepend from 'postcss-prefix-selector';
import autoprefixer from 'autoprefixer';

let _currBuild = null;

// if called directly, do the thing.
if (process.argv[1].indexOf('build_css.js') > -1) {
  buildCSS();
}


export function buildCSS() {
  if (_currBuild) return _currBuild;

  const START = '🏗   ' + chalk.yellow('Building css...');
  const END = '👍  ' + chalk.green('css built');

  console.log('');
  console.log(START);
  console.time(END);

  return _currBuild =
    Promise.resolve()
      .then(() => glob.globSync('css/**/*.css'))
      .then(files => doConcat(files.sort(), 'dist/iD.css'))
      .then(() => {
        const css = fs.readFileSync('dist/iD.css', 'utf8');
        return postcss([
            autoprefixer,
            prepend({ prefix: '.ideditor', exclude: [ /^\.ideditor(\[.*?\])*/ ] })
          ])
          .process(css, { from: 'dist/iD.css', to: 'dist/iD.css' });
      })
      .then(result => fs.writeFileSync('dist/iD.css', result.css))
      .then(() => {
        console.timeEnd(END);
        console.log('');
        _currBuild = null;
      })
      .catch(err => {
        console.error(err);
        console.log('');
        _currBuild = null;
        process.exit(1);
      });
}


function doConcat(files, output) {
  return new Promise((resolve, reject) => {
    concat(files, output, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
