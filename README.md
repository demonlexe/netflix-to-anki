# netflix-to-anki
Chrome extension allowing users to translate Netflix + Hulu subtitles by clicking, and these clicks can be exported to Anki decks.

It also supports the automatic translation while watching, if applicable.

# Installation

Get the chrome extension here:
[https://chromewebstore.google.com/detail/netflix-to-anki/nclpenomcdmjiibjgjbibndlckdkmeda?](https://chromewebstore.google.com/detail/netflix-to-anki/nclpenomcdmjiibjgjbibndlckdkmeda?)

## Supported Languages

Note: Any language you desire may work, since we directly use your "Learning Language" text input. This is not a comprehensive list of languages that can work.

Currently tested languages include (but are not limited to):
- English
- Spanish
- French
- German
- Dutch
- Pig Latin
- Latin
- Japanese
- Chinese

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

# Installation

Get the chrome extension here:
[https://chromewebstore.google.com/detail/netflix-to-anki/nclpenomcdmjiibjgjbibndlckdkmeda?](https://chromewebstore.google.com/detail/netflix-to-anki/nclpenomcdmjiibjgjbibndlckdkmeda?)

