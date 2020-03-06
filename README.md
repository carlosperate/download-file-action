# download-file-action

![.github/workflows/action-test.yml](https://github.com/carlosperate/download-file-action/workflows/.github/workflows/action-test.yml/badge.svg)

Cross platform GH Action to download a file from the internet


## Inputs

### `file-url`

**Required** The URL of the file to download.

### `file-name`

A new filename to rename the downloaded file.

### `location`

The path to download the file.


## Outputs

### `file-path`

The full path to the downloaded file.


## Example usage

```yml
- name: Download a file
    uses: carlosperate/download-file-action@v1
    id: download-poetry
    with:
        file-url: 'https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py'
```
