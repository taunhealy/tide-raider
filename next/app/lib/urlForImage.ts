// // The builder object lets you chain methods like this:
/* urlForImage(myImage)
.width(300)       // set width
.height(300)      // set height
.blur(50)         // add blur effect
.format('webp')   // convert to webp format
.url()            // finally get the actual URL string

// Each method call returns the builder object itself, 
// allowing you to keep adding more transformations

*/ 

import imageUrlBuilder from '@sanity/image-url';
import { client } from './sanity';

const builder = imageUrlBuilder(client);

export function urlForImage(source: any) {
  if (!source) return null;
  return builder.image(source);
}