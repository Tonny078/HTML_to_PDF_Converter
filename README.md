# HTML to PDF Converter

A simple batch tool that converts HTML files into full-page PDFs using headless Chrome (via [Puppeteer](https://pptr.dev/)). Drop any number of `.html` files into `input` folder, run the `run-universal-converter.bat`, and get pixel-accurate PDFs out, full page, background colors, fonts, emoji, and charts all preserved as they'd render in a real browser.

Free to use, modify, and distribute under the [MIT License](LICENSE).

## Features

- 📁 **Batch conversion** — processes every `.html`/`.htm` file in the input folder in one run
- 🖨️ **Full-page capture** — no cut-off content, no fixed page breaks; the PDF matches the page's real rendered height and width
- 🎨 **Faithful rendering** — background colors/images, custom fonts, and emoji render exactly as they do in Chrome
- 📊 **Dynamic content support** — waits for fonts and any `Chart.js` charts to finish rendering before capturing
- 🧯 **Resilient batch runs** — if one file fails, it's skipped and the rest of the batch still completes
- 🖥️ **Cross-platform** — runs anywhere Node.js runs; Windows users also get one-click `.bat`/`.ps1` launchers

## Requirements

- [Node.js](https://nodejs.org/) (includes npm)

## Installation

```bash
npm install
```

This installs Puppeteer, which downloads its own bundled Chromium on first install.

## Usage

1. Put the HTML file(s) you want converted into the `input/` folder.
2. Run the converter:

   **Windows** — double-click `run-universal-converter.bat` (or run `run-universal-converter.ps1` in PowerShell)

   **Any platform**
   ```bash
   npm start
   ```
3. Collect your PDFs from the `output/` folder, named `<original-filename>_Full.pdf`.

## Folder structure

```
├── input/                       # Put your .html files here
├── output/                      # Generated PDFs land here
├── universal-converter.js       # The converter script
├── run-universal-converter.bat  # Windows launcher (double-click)
├── run-universal-converter.ps1  # Windows PowerShell launcher
└── package.json
```

## How it works

The script launches a headless Chrome instance via Puppeteer, opens each HTML file in a full browser page, waits for fonts/content/charts to finish loading, measures the page's actual rendered dimensions, and exports a PDF sized to match — so the output looks the same as opening the file in a real browser, not a cropped or paginated version of it.

## Known limitations

- **Fixed content-load wait times**: the script waits a fixed ~5 seconds (plus shorter waits for fonts/charts) before capturing each page. This is enough for most static pages, but a very heavy page (lots of large images, slow-loading fonts, etc.) could get captured before it's fully ready. If you notice incomplete output, increase the `setTimeout` delays near the top of `convertSingleFile()` in `universal-converter.js`.
- **Fixed viewport width**: pages are rendered at a 1920px-wide viewport (the PDF width follows the actual content width, with 1920px as a floor). This suits most desktop-oriented HTML but can be adjusted by editing the `setViewport()` call in `universal-converter.js` if you need a different base width.

## Troubleshooting

| Problem | Cause / Fix |
|---|---|
| `Input directory not found` | The `input/` folder is missing — create it (or check it wasn't accidentally deleted) and add your `.html` files. |
| `No HTML files found in input directory` | The `input/` folder is empty, or your files don't end in `.html`/`.htm`. |
| PDF looks cut off or incomplete | The page probably needs more time to load — see [Known limitations](#known-limitations) above. |
| `npm install` fails / Puppeteer download issues | Make sure you have a stable internet connection on first install — Puppeteer downloads a full Chromium build the first time. |

## License

MIT — see [LICENSE](LICENSE). Free to use, modify, and distribute.
