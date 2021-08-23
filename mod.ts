import { transform, compile } from "https://deno.land/x/astro_compiler@v0.1.0-canary.24/mod.ts";

const src = new URL('./src', import.meta.url);

async function getHTML(pathname: string) {
  const content = await Deno.readFile(new URL(pathname, src));
  const template = await transform(content.toString());
  const html = await compile(template);
  return html;
}
async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);
  console.log(pathname);
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
