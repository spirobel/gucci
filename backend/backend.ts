import { url, head, html, commonHead, cssReset } from "@spirobel/mininext";
head(html`<title>hello hello</title>${commonHead}${cssReset}`);
url.set([
  ["/", (mini) => mini.html`<h1>Hello world</h1>`],
  [
    "/bye",
    (mini) =>
      mini.html`<h1>Goodbye world</h1>${mini.head(
        mini.html`<title>bye bye</title>${commonHead}`
      )}`,
  ],
]);

export default url.install;
