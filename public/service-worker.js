"use strict"; // forces all errors, helps you write cleaner code

// files to cache for offline use
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/client.js',
  '/style.css',
  '/manifest.json',
  '/addserviceworker.js',
  '/images/icons/apple-touch-icon-128x128.png',
  '/images/icons/apple-touch-icon-144x144.svg',
  '/images/icons/apple-touch-icon-152x152.png',
  '/images/icons/apple-touch-icon-192x192.png',
  '/images/icons/apple-touch-icon-256x256.png',
  '/images/icons/apple-touch-icon-512x512.png',
  '/images/icons/favicon.ico',
  '/images/pattern.png',
];
///scripts/install.js',
/* Providing a cache name, allows us to version files so we 
 * can easily update some files w/o affecting others. Change
 * the cache name any tine any of the cached files have changed.
 */
const CACHE_NAME = "static-cache-v14";
const DATA_CACHE_NAME = "data-cache-v14";

/* Adds an install event to the page that caches offline resources */
self.addEventListener("install", evt => {
  console.log ("[service worker] install");
  
  // precache static resources
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[Service Worker] Precaching offline page");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* Once your service worker is ready to control clients and handle
 * functional events like push and sync, you'll get an activate event 
 */
self.addEventListener('activate', (evt) => {
  console.log('[Service Worker] Activate');
  
  // remove previously cached files from disk
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
      
        if (key !== CACHE_NAME  &&  key !== DATA_CACHE_NAME){
          console.log('[Service worker] Removing old cache', key);
          return caches.delete(key); 
        }
      }));
    })
  );
  
  // start controlling all loaded clients w/o reloading them
  self.clients.claim();
});

/* handle fetch events by looking to the network first
 * and then the cache
 */
self.addEventListener('fetch', (evt) => {
  console.log('[Service Worker] Fetch', evt.request.url);
  if (evt.request.url.includes("/references/") || evt.request.url.includes("/soundc11/")) {
     console.log("[Service Worker] Fetch (data)", evt.request.url);
     evt.respondWith(
       caches.open(DATA_CACHE_NAME).then(cache => {
         return fetch(evt.request)
           .then (response => {
             //if the response was good, clone it and store it in cache
             if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
             }
             return response;
         })
         .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
         });
       })
     );
    return;
  } // if
  
  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })  
  );
});



