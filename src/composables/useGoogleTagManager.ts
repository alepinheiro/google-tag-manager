/**
 * A hook that injects the Google Tag Manager script into a web page.
 *
 * @param w - The `window` object, representing the global context of the browser.
 * @param d - The `document` object, representing the HTML document loaded in the window.
 * @param s - The tag name of the element where the GTM script will be injected. Usually "script".
 * @param l - The name of the data layer object. Typically "dataLayer".
 * @param i - The Google Tag Manager ID (GTM-XXXXXX).
 */
export const useGoogleTagManager = (
  w: Window,
  d: Document,
  s: string = 'script',
  l: string = 'dataLayer',
  i: string,
): void => {
  // Safely initialize the data layer if it doesn't exist
  const dataLayer = w[l as keyof typeof w] || [];
  (w as any)[l] = dataLayer;

  // Push the initial GTM event with the current timestamp
  dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  // Get the first script element in the document
  const f = d.getElementsByTagName(s)[0] as HTMLScriptElement;

  // Create a new script element for the GTM script
  const j = d.createElement(s) as HTMLScriptElement;

  // Append a query parameter if the data layer is named differently from the default "dataLayer"
  const dl = l !== 'dataLayer' ? `&l=${l}` : '';

  // Set the script to load asynchronously
  j.async = true;

  // Set the source of the script to the GTM URL with the provided ID
  j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;

  // Insert the GTM script before the first script tag in the document
  f.parentNode?.insertBefore(j, f);
};
