# Developer Documentation

## Update v1 tag

```
git tag -fa v1 -m "Update v1 tag"
git push origin v1 --force
```

## Updating packages

This is a list of some breaking changes encountered when updating some of the
packages.
These should all be easily resolvable, but haven't had the chance yet to look
into it.
It's possible we might move from having a local mod of the `download` package
and move to https://github.com/hgouveia/node-downloader-helper, so that
should alleviate some of these as well.

### Typescript

When updated to v4.7, `npm run package` throws the following error:

```
> tsc

node_modules/peek-readable/lib/StreamReader.d.ts:1:23 - error TS1452: 'resolution-mode' assertions are only supported when `moduleResolution` is `node16` or `nodenext`.

1 /// <reference types="node" resolution-mode="require"/>
                        ~~~~

node_modules/strtok3/lib/core.d.ts:1:23 - error TS1452: 'resolution-mode' assertions are only supported when `moduleResolution` is `node16` or `nodenext`.

1 /// <reference types="node" resolution-mode="require"/>
                        ~~~~

node_modules/strtok3/lib/index.d.ts:1:23 - error TS1452: 'resolution-mode' assertions are only supported when `moduleResolution` is `node16` or `nodenext`.

1 /// <reference types="node" resolution-mode="require"/>
                        ~~~~

node_modules/strtok3/lib/ReadStreamTokenizer.d.ts:1:23 - error TS1452: 'resolution-mode' assertions are only supported when `moduleResolution` is `node16` or `nodenext`.

1 /// <reference types="node" resolution-mode="require"/>
                        ~~~~

node_modules/strtok3/lib/types.d.ts:1:23 - error TS1452: 'resolution-mode' assertions are only supported when `moduleResolution` is `node16` or `nodenext`.

1 /// <reference types="node" resolution-mode="require"/>
                        ~~~~


Found 5 errors in 5 files.

Errors  Files
     1  node_modules/peek-readable/lib/StreamReader.d.ts:1
     1  node_modules/strtok3/lib/core.d.ts:1
     1  node_modules/strtok3/lib/index.d.ts:1
     1  node_modules/strtok3/lib/ReadStreamTokenizer.d.ts:1
     1  node_modules/strtok3/lib/types.d.ts:1
```

### got

Updating to v9 throws this error when running:

```
Error: Failed to pipe. The response has been emitted already.
```

Updating to v10+ throws this error when running:

```
Error: To get a Buffer, set `options.responseType` to `buffer` instead
```

### pify
### p-event
### filenamify

The next major version of these packages are pure ESM, so the imports in
`dowload-mod.js` will have to be updated.
