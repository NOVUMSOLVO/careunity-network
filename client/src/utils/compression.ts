/**
 * Compression Utilities
 * 
 * Utilities for compressing and decompressing data.
 */

/**
 * Compress data using the browser's CompressionStream API
 * Falls back to JSON.stringify for browsers that don't support CompressionStream
 */
export async function compress(data: any): Promise<string> {
  // Convert data to string if it's not already
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  
  // Check if CompressionStream is supported
  if (typeof CompressionStream !== 'undefined') {
    try {
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonString);
      
      // Create a compression stream
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      
      // Write data to the compression stream
      writer.write(uint8Array);
      writer.close();
      
      // Read compressed data
      const chunks = [];
      let result;
      
      while (true) {
        result = await reader.read();
        if (result.done) break;
        chunks.push(result.value);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const compressedData = new Uint8Array(totalLength);
      
      let offset = 0;
      for (const chunk of chunks) {
        compressedData.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Convert to base64
      return btoa(String.fromCharCode.apply(null, Array.from(compressedData)));
    } catch (error) {
      console.warn('CompressionStream failed, falling back to JSON.stringify', error);
      // Fall back to JSON.stringify
      return jsonString;
    }
  } else {
    // Fall back to JSON.stringify
    return jsonString;
  }
}

/**
 * Decompress data using the browser's DecompressionStream API
 * Falls back to JSON.parse for browsers that don't support DecompressionStream
 */
export async function decompress(data: string): Promise<any> {
  // Check if the data is compressed (base64 encoded)
  const isCompressed = isBase64(data);
  
  if (isCompressed && typeof DecompressionStream !== 'undefined') {
    try {
      // Convert base64 to Uint8Array
      const binaryString = atob(data);
      const uint8Array = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      // Create a decompression stream
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      
      // Write data to the decompression stream
      writer.write(uint8Array);
      writer.close();
      
      // Read decompressed data
      const chunks = [];
      let result;
      
      while (true) {
        result = await reader.read();
        if (result.done) break;
        chunks.push(result.value);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const decompressedData = new Uint8Array(totalLength);
      
      let offset = 0;
      for (const chunk of chunks) {
        decompressedData.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Convert to string
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decompressedData);
      
      // Parse JSON
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('DecompressionStream failed, falling back to JSON.parse', error);
      // Fall back to JSON.parse
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
  } else {
    // Fall back to JSON.parse
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
}

/**
 * Check if a string is base64 encoded
 */
function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}
