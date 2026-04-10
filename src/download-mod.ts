/*
 * This file was originally the main source code for the nodejs download lib:
 * https://github.com/kevva/download commit a16ba04b30dafbe7d9246db93f1534320d8e0dd3
 *
 * It has been modified:
 * - Set the path as a required argument
 * - Removed decompressing functionality
 * - Return the file path instead of the file data
 * - Updated `got` import to use named export (`{ got }`) for compatibility with got v12+
 * - Replaced `encoding: null` option with `responseType: 'buffer'` for got v12+ compatibility
 * - Replaced `rejectUnauthorized` option with `https: { rejectUnauthorized }` for got v12+
 * - Extracted `filename` from opts before passing to `got` to avoid unexpected option error
 * - Converted to TypeScript with top-level ESM imports
 * - Replaced sync `fileType()` call with async `fileTypeFromBuffer()` for file-type v18+
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

import fs from 'fs';
import path from 'path';
import contentDisposition from 'content-disposition';
import filenamify from 'filenamify';
import { got, type PlainResponse } from 'got';
import makeDir from 'make-dir';
import pEvent from 'p-event';
import { fileTypeFromBuffer } from 'file-type';
import extName from 'ext-name';
import getStream from 'get-stream';

interface DownloadOptions {
  filename?: string;
  [key: string]: unknown;
}

const getExtFromMime = (res: PlainResponse): string | null => {
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

const getFilename = async (res: PlainResponse, data: Buffer): Promise<string> => {
  const header = res.headers['content-disposition'];

  if (header) {
    const parsed = contentDisposition.parse(header);

    if (parsed.parameters && parsed.parameters.filename) {
      return parsed.parameters.filename;
    }
  }

  let filename = path.basename(res.requestUrl.pathname);

  if (!path.extname(filename)) {
    const detected = await fileTypeFromBuffer(data);
    const ext = (detected ?? {}).ext ?? getExtFromMime(res);

    if (ext) {
      filename = `${filename}.${ext}`;
    }
  }

  return filename;
};

export default async function download(
  uri: string,
  output_?: string,
  opts_?: DownloadOptions,
): Promise<string> {
  const output = output_ ?? process.cwd();
  const { filename: filenameOpt, ...gotOpts } = opts_ ?? {};
  const opts = {
    responseType: 'buffer' as const,
    https: { rejectUnauthorized: process.env.npm_config_strict_ssl !== 'false' },
    ...gotOpts,
  };

  const stream = got.stream(uri, opts);
  const res = await pEvent(stream, 'response') as PlainResponse;
  const data = await getStream.buffer(stream);

  const filename = filenameOpt ?? filenamify(await getFilename(res, data));
  const outputFilepath = path.join(output, filename);

  await makeDir(path.dirname(outputFilepath));
  await fs.promises.writeFile(outputFilepath, data);
  return outputFilepath;
}
