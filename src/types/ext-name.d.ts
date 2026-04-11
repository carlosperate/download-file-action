declare module 'ext-name' {
  interface ExtNameEntry {
    ext: string;
    mime: string;
  }
  function extName(filename: string): ExtNameEntry[];
  namespace extName {
    function mime(mimeType: string): ExtNameEntry[];
  }
  export default extName;
}
