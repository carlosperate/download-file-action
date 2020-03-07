// Type definitions for download-mod
// Project: https://github.com/carlosperate/download-file-action

interface DownloadOptions {
    filename?: string;
}

declare function download(
    url: string,
    output_: string,
    opts_?: DownloadOptions
): Promise<string>;

export = download;
