import { transform, compile } from "https://deno.land/x/astro_compiler@v0.1.0-canary.44/mod.ts";
import { exists } from "https://deno.land/std@0.105.0/fs/exists.ts";
import { extname } from "https://deno.land/std@0.105.0/path/mod.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts"


async function getHTML(pathname: string) {
  if (pathname.endsWith('/')) {
    pathname = pathname + 'index.astro'
  }
  if (extname(pathname) == '') {
    pathname = pathname + '.astro'
  }
  const fileURL = new URL('./src/pages' + pathname, import.meta.url);

  if (await exists(`./src/pages/${pathname}`)) {
    try {
      const content = await Deno.readTextFile(fileURL);
      const template = await transform(content);
      const html = await compile(template)
      return html;
    } catch (e) {
      return `<h1>Error!</h1><pre>${e}</pre>`
    }
  }

  return `<h1>404</h1><pre>Unable to find ${pathname}</pre>`
}

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);
  if (extname(pathname) !== '' && await exists(`./public/${pathname}`)) {
    const content = await Deno.readFile(new URL(`./public/${pathname}`, import.meta.url));
    const contentType = mime.getType(extname(pathname).slice(1)) || 'text/plain';
    return new Response(content, {
      headers: {
        "content-type": contentType
      }
    })
  }
  const html = await getHTML(pathname);

  return new Response(html, {
      headers: {
        // The interpretation of the body of the response by the client depends
        // on the 'content-type' header.
        // The "text/html" part implies to the client that the content is HTML
        // and the "charset=UTF-8" part implies to the client that the content
        // is encoded using UTF-8.
        "content-type": "text/html; charset=UTF-8",
      },
    });
}

addEventListener("fetch", (event: Deno.RequestEvent) => {
  event.respondWith(handleRequest(event.request));
});
