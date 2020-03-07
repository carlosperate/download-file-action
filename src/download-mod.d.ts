// Type definitions for download-mod
// Project: https://github.com/carlosperate/download-file-action

interface DownloadOptions {
    filename?: string;
}

export declare function download(
    url: string,
    destination: string,
    options?: DownloadOptions
): Promise<string>;
