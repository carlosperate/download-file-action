# download-file-action

![Workflow To Test Action](https://github.com/carlosperate/download-file-action/workflows/Workflow%20To%20Test%20Action/badge.svg)

GitHub Action to download a file from the internet into the workspace.


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
- name: Print the file path
    run: echo "The file was downloaded to ${{ steps.download-poetry.outputs.file-path }}"
```
