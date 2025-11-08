declare module 'pdf-parse' {
  interface PDFParseData {
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    version?: string;
    text?: string;
  }

  function parse(data: Buffer | Uint8Array | ArrayBuffer, options?: any): Promise<PDFParseData>;
  export default parse;
}

