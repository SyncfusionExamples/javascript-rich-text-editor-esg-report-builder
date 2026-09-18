# ESG Report Builder with JavaScript Rich Text Editor

A single-page **ESG sustainability report builder** POC built on the **Syncfusion
JavaScript (ES5) Rich Text Editor** — no build tools, no bundler, no framework.

A sustainability manager loads a predefined ESG template, edits and formats the
report (bold headings, colors, lists, hyperlinks, KPI tables), inserts evidence
images, watches a live A4-style preview, and exports the result as a real
**Word (.docx)** or **PDF** document using the RTE's **inbuilt Import/Export
features**.

---

## Tech stack

| Layer          | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Platform       | JavaScript **ES5** (no transpiler, global scripts)             |
| Main control   | Syncfusion **EJ2 Rich Text Editor** (`ej.richtexteditor`)      |
| Delivery       | CDN `cdn.syncfusion.com/ej2/34.2.2` (pinned)                   |
| Theme          | EJ2 `tailwind3` + app styles in `css/styles.css`               |
| Persistence    | `localStorage` autosave (draft survives refresh)               |
| Import/Export  | **Inbuilt EJ2 RTE features** via Syncfusion document services |
| Images         | Inbuilt RTE uploader to the Syncfusion image service           |

## Run
The app is static - open `index.html` file directly.

or

serve the folder over any local web server (opening
`index.html` via `file://` may be blocked by the CDN/CORS in some browsers):

```bash
npx http-server esg-report-rte-web-frontend -p 8080 -o
```

## The five POC steps

| Step | Where | RTE features demonstrated |
| ---- | ----- | -------------------------- |
| 1. Load template | **Create New Report** button | Preloaded content, headings, lists, structure |
| 2. Edit & format | RTE toolbar | Bold, font/color, alignment, lists, links, **KPI table** |
| 3. Insert evidence | Toolbar **Image** (+ quick toolbar) | Image insert, resize, align, alt text |
| 4. Preview | Right panel | WYSIWYG editing, professional A4 document layout |
| 5. Export | **Export as Word / PDF** buttons or `ImportWord`/`ExportWord`/`ExportPdf` toolbar tools | Inbuilt Word/PDF export + Word import |

## Import/Export & image services

All document operations use the **Rich Text Editor's inbuilt Import/Export
functionality** and its inbuilt image uploader — there is no custom export
code anywhere in the app. The endpoints live in one place, `js/config.js`:

```js
services: {
    baseUrl: 'https://services.syncfusion.com/js/production/',
    imageSavePath:   'api/RichTextEditor/SaveFile',
    imageRemovePath: 'api/RichTextEditor/DeleteFile',
    imagePath:       'RichTextEditor/',
    importWordPath:  'api/RichTextEditor/ImportFromWord',
    exportWordPath:  'api/RichTextEditor/ExportToDocx',
    exportPdfPath:   'api/RichTextEditor/ExportToPdf'
}
```

By default they point at Syncfusion's hosted sample service, so the POC works
out of the box. For production, deploy the official Syncfusion server-side
converter (ASP.NET Core / ASP.NET MVC / Java) and change `baseUrl` — every
feature (Word import, .docx/.pdf export, image save/remove) flows from it.

> We also suggest our [**Syncfusion® JavaScript ES5 DOCX Editor**](https://www.syncfusion.com/docx-editor-sdk/javascript-docx-editor) for ESG report builder requirement for complete Word editing capabilities.


# ESG Report Builder with Syncfusion JavaScript DOCX Editor

Proof of concept that generates a rich, fully-editable **ESG (Environmental, Social, Governance) sustainability report** as a Word document, powered by the **Syncfusion® JavaScript (EJ2) DOCX Editor** in **Ribbon toolbar mode**.

---

## ✨ What it demonstrates

| Capability | How the POC shows it |
|---|---|
| Word-style UI | `DocumentEditorContainer` with **Ribbon toolbar** (`toolbarMode: "Ribbon"`) — Home, Insert, Layout, Review, View, References, plus contextual tabs (Table Design, Table Layout, Header & Footer…) |
| Document *generation* | The SFDT builder programmatically creates a multi-section report: cover page, TOC, KPI tables, native charts, site tables, appendix |
| Data-driven reports | Edit the ESG metrics in the sidebar → **Generate report** re-renders everything (tables, charts, year-over-year calculations) |
| Charts | Line (GHG emissions), column (LTIFR), doughnut (board composition) — embedded as images |
| Auto TOC | Inserted programmatically via `insertTableOfContents()` on a bookmark placeholder |
| Word compatibility | Export to `.docx` client-side and open in Microsoft Word |
| Review workflow | Track changes + comments built into the Ribbon's Review tab |
| Save drafts | Export / reopen `.sfdt` with no server needed |
| Layout & review chrome | Ruler, status bar (page count, zoom), find & replace, styles gallery, headers/footers |

## 🚀 Quick start

Open `index.html` file

Then:

1. A report is generated automatically on load.
2. Change the **company / period / scope / framework** or any **metric** in the sidebar.
3. Click **▶ Generate report** to rebuild the document.
4. Edit it like Word — the Ribbon gives you formatting, tables, images, hyperlinks, headers/footers, track changes and comments.
5. Export via **Save as .docx**, save a `.sfdt` draft, or print.

> Opening `.docx` files directly (instead of generating) requires the optional Syncfusion Word Processor web service — see [Server (optional)](#-server-optional) below. Generation → edit → export stays fully client-side.

## 🖥️ Server (optional)

The DOCX editor only needs a web service for:

- opening non-SFDT files (`.docx`, `.doc`, `.rtf`, `.txt`, …),
- spell-check with formatting, restricted editing, PDF export,
- paste-with-formatting in some browsers.

You can reuse the open-source [`EJ2-DocumentEditor-WebServices`](https://github.com/SyncfusionExamples/EJ2-DocumentEditor-WebServices) samples or the official Docker image, then point `container.serviceUrl` at your deployment. This POC does not require it.