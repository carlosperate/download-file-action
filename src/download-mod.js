/*
 * This file was originally the main source code for the nodejs download lib:
 * https://github.com/kevva/download commit a16ba04b30dafbe7d9246db93f1534320d8e0dd3
 *
 * It has been modified:
 * - Set the path as a required argument
 * - Removed decompressing functionality
 * - Return the file path instead of the file data
 *
 * Original license can be found below:
 *
 * MIT License
 *
 * Copyright (c) Kevin Mårtensson <kevinmartensson@gmail.com> (github.com/kevva)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const contentDisposition = require('content-disposition');
const filenamify = require('filenamify');
const getStream = require('get-stream');
const got = require('got');
const makeDir = require('make-dir');
const pify = require('pify');
const pEvent = require('p-event');
const fileType = require('file-type');
const extName = require('ext-name');

const fsP = pify(fs);
const filenameFromPath = (res) => path.basename(new URL(res.requestUrl).pathname);

const getExtFromMime = (res) => {
  const header = res.headers['content-type'];

  if (!header) {
    return null;
  }

  const exts = extName.mime(header);

  if (exts.length !== 1) {
    return null;
  }

  return exts[0].ext;
};

const getFilename = (res, data) => {
  const header = res.headers['content-disposition'];

  if (header) {
    const parsed = contentDisposition.parse(header);

    if (parsed.parameters && parsed.parameters.filename) {
      return parsed.parameters.filename;
    }
  }

  let filename = filenameFromPath(res);

  if (!path.extname(filename)) {
    const ext = (fileType(data) || {}).ext || getExtFromMime(res);

    if (ext) {
      filename = `${filename}.${ext}`;
    }
  }

  return filename;
};

module.exports = (uri, output_, opts_) => {
  const output = output_ || process.cwd();
  const buff = Buffer.from(`${opts_.username}:${opts_.password}`);
  const opts = {
    encoding: null,
    rejectUnauthorized: process.env.npm_config_strict_ssl !== 'false',
    headers: {
      Authorization: `Basic ${buff.toString('base64')}`,
    },
    ...opts_,
  };
  const stream = got.stream(uri, opts);

  const promise = pEvent(stream, 'response').then((res) => {
    const encoding = opts.encoding === null ? 'buffer' : opts.encoding;
    return Promise.all([getStream(stream, { encoding }), res]);
  }).then((result) => {
    const [data, res] = result;
    const filename = opts.filename || filenamify(getFilename(res, data));
    const outputFilepath = path.join(output, filename);

    return makeDir(path.dirname(outputFilepath))
      .then(() => fsP.writeFile(outputFilepath, data))
      .then(() => outputFilepath);
  });

  stream.then = promise.then.bind(promise);
  stream.catch = promise.catch.bind(promise);

  return stream;
};
