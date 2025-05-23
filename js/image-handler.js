// Image handling function for the service worker
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  // Try to find the image in cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try modern format if browser supports it
  try {
    const modernRequest = createModernImageRequest(request);
    
    // If the modernRequest is different from the original request
    if (modernRequest.url !== request.url) {
      // Check if we have the modern format cached
      const modernCachedResponse = await cache.match(modernRequest);
      if (modernCachedResponse) {
        return modernCachedResponse;
      }
      
      // Try to fetch the modern format
      try {
        const modernResponse = await fetch(modernRequest);
        if (modernResponse.ok) {
          // Cache the modern format and return it
          await cache.put(modernRequest, modernResponse.clone());
          return modernResponse;
        }
      } catch (error) {
        console.log('Failed to fetch modern image format:', error);
      }
    }
  } catch (error) {
    console.error('Error handling modern image format:', error);
  }
  
  // Fallback to original image format
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.error('Network error fetching image:', error);
    return new Response('Network error', { status: 408 });
  }
  
  // Fallback to offline image if available
  const offlineResponse = await cache.match('/assets/offline-image.png');
  if (offlineResponse) {
    return offlineResponse;
  }
  
  // Last resort - return error response
  return new Response('Image not available', { status: 404 });
}
