# netflix-to-anki
Chrome extension allowing users to translate Netflix subtitles by clicking, and these clicks can be exported to Anki decks.

It also supports the automatic translation while watching, if applicable.

Currently tested languages include:
- English
- Spanish
- French
- German
- Dutch
- Pig Latin
- Latin
- Japanese
- Chinese
- More to come!

## "pay what you want"
Hi there!

If you've found my project helpful or inspiring, consider showing your support by buying me a coffee. Your contributions help keep the project running and allow me to continue developing and improving it. Every little bit helps and is greatly appreciated!

Thank you for your support!
[Buy Me A Coffee](https://buymeacoffee.com/demonlexe)

## DEVELOPING

Install dependencies:
```bash
npm i
```
Run the development server:
```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
