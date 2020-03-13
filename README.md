# download-file-action

![Workflow To Test Action](https://github.com/carlosperate/download-file-action/workflows/Workflow%20To%20Test%20Action/badge.svg)

GitHub Action to download a file from the internet into the workspace.


## Inputs

- `file-url`: (**Required**) The URL of the file to download.
- `file-name`: (**Optional**) A new filename to rename the downloaded file.
- `location`: (**Optional**) A path to download the file.


## Outputs

- `file-path`: The full path to the downloaded file.


## Example usage

```yml
- name: Download a file
    uses: carlosperate/download-file-action@v1.0.0
    id: download-poetry
    with:
        file-url: 'https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py'
        file-name: 'new_filename.py'
        location: './new-folder-to-be-created'
- name: Print the file path
    run: echo "The file was downloaded to ${{ steps.download-poetry.outputs.file-path }}"
```
