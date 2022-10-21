# download-file-action

![Workflow To Test Action](https://github.com/carlosperate/download-file-action/workflows/Workflow%20To%20Test%20Action/badge.svg)

GitHub Action to download a file from the internet into the workspace.


## Inputs

- `file-url`: **(Required)** The URL of the file to download.
- `file-name`: *(Optional)* A new filename to rename the downloaded file.
- `location`: *(Optional)* A path to download the file.
- `md5`: *(Optional)* An MD5 hash to verify the download.
- `sha256`: *(Optional)* An SHA256 hash to verify the download.


## Outputs

- `file-path`: The absolute path to the downloaded file.


## Example usage

In its simplest form you can you indicate what file to download and use it:

```yaml
- name: Download a file
  uses: carlosperate/download-file-action@v2
  with:
    file-url: 'https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py'
- name: Check the file is there
  run: ls -l get-poetry.py
```

To use all the options:

```yml
- name: Download a file
  uses: carlosperate/download-file-action@v2
  id: download-file
  with:
    file-url: 'https://github.com/carlosperate/download-file-action/archive/refs/tags/v1.0.3.tar.gz'
    file-name: 'new_filename.tar.gz'
    location: './new-folder-to-be-created'
    md5: 'e3b51204dedc75588ca164a26b51610d'
    sha256: '76ef5cf6e910a4955f713fb36cca6f90ffeee6ffafe743754716e149d68136de'
- name: Print the file path (new-folder-to-be-created/new_filename.tar.gz)
  run: echo "The file was downloaded to ${{ steps.download-file.outputs.file-path }}"
```
