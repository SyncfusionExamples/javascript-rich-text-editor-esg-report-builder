/* ============================================================================
   ESG_Report_RTE - Application bootstrap
   Plain JavaScript ES5.

   Responsibilities:
     - Initialize the Syncfusion EJ2 Rich Text Editor (global ej namespace)
       with a document-focused toolbar, quick toolbars and the inbuilt
       Import/Export features (ImportWord / ExportWord / ExportPdf) wired to
       the hosted document services (see AppConfig.services).
     - Step 1: "Create New Report" loads the predefined ESG template.
     - Step 2: formatting via toolbar (bold, colors, lists, links, tables).
     - Step 3: evidence images (server upload via insertImageSettings).
     - Step 4: live side-by-side preview (A4-styled page).
     - Step 5: "Export as Word / PDF" buttons delegate to the RTE's native
       exportWord() / exportPdf() methods.
     - Draft autosave to localStorage (change event per saveInterval);
       draft restored on load.
   ========================================================================== */

(function () {

    var rte = null;
    var els = {};

    /* ------------------------------------------------------------------ */
    /* DOM helpers (ES5)                                                   */
    /* ------------------------------------------------------------------ */

    function $(id) { return document.getElementById(id); }

    function setStatus(text) {
        if (els.statusText) { els.statusText.innerHTML = text; }
    }

    function setSavedAt(savedAt) {
        if (!els.savedAt) { return; }
        if (!savedAt) {
            els.savedAt.innerHTML = '';
            return;
        }
        var d = new Date(savedAt);
        function two(n) { return (n < 10 ? '0' : '') + n; }
        els.savedAt.innerHTML = 'Last saved ' + two(d.getHours()) + ':' + two(d.getMinutes())
            + ':' + two(d.getSeconds());
    }

    /* ------------------------------------------------------------------ */
    /* Preview (Step 4)                                                    */
    /* ------------------------------------------------------------------ */

    function updatePreview() {
        if (!rte || !els.previewContent) { return; }
        var html = rte.getHtml();
        if (!html || html.replace(/<br\s*\/?>/g, '').replace(/<p><\/p>/g, '').trim() === '') {
            els.previewContent.innerHTML = '<p class="preview-empty">Click <strong>Create New Report</strong> to load the ESG template.</p>';
            return;
        }
        els.previewContent.innerHTML = html;
    }

    /* ------------------------------------------------------------------ */
    /* Draft persistence                                                   */
    /* ------------------------------------------------------------------ */

    function saveDraft(silent) {
        if (!rte) { return; }
        var ok = EsgStorage.save(rte.getHtml());
        if (ok) {
            setSavedAt(new Date().getTime());
            if (!silent) { setStatus('Draft saved to this browser.'); }
        } else {
            setStatus('<span class="status-warn">Draft could not be saved (storage quota or storage disabled). '
                + 'Consider removing large images before continuing.</span>');
        }
    }

    /* ------------------------------------------------------------------ */
    /* RTE initialization                                                  */
    /* ------------------------------------------------------------------ */

    function createEditor(initialValue) {
        var editor = new ej.richtexteditor.RichTextEditor({

            /* Step 1 - preloaded content comes from EsgTemplate. */
            value: initialValue,

            /* Rich text formatting, tables, hyperlinks, alignment. */
            toolbarSettings: {
                enable: true,
                type: 'Expand',
                items: [
                    'Undo', 'Redo', '|',
                    'Formats', 'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
                    'Bold', 'Italic', 'Underline', 'StrikeThrough', 'ClearFormat', '|',
                    'NumberFormatList', 'BulletFormatList', 'Outdent', 'Indent', '|',
                    'Alignments', '|',
                    'CreateLink', 'Image', 'CreateTable', '|',
                    'Print', 'SourceCode', 'FullScreen', '|',
                    /* Step 5 - inbuilt Import/Export tools. */
                    'ImportWord', 'ExportWord', 'ExportPdf'
                ]
            },

            /* Document services behind the inbuilt features:
               image upload/remove, Word import, Word/PDF export. */
            insertImageSettings: {
                allowedTypes: ['.jpeg', '.jpg', '.png', '.svg', '.webp'],
                display: 'inline',
                width: 'auto',
                height: 'auto',
                maxFileSize: 2000000,
                saveUrl: AppConfig.services.baseUrl + AppConfig.services.imageSavePath,
                removeUrl: AppConfig.services.baseUrl + AppConfig.services.imageRemovePath,
                path: AppConfig.services.baseUrl + AppConfig.services.imagePath
            },
            importWord: {
                serviceUrl: AppConfig.services.baseUrl + AppConfig.services.importWordPath
            },
            exportWord: {
                serviceUrl: AppConfig.services.baseUrl + AppConfig.services.exportWordPath,
                fileName: AppConfig.report.defaultFileName + '.docx'
            },
            exportPdf: {
                serviceUrl: AppConfig.services.baseUrl + AppConfig.services.exportPdfPath,
                fileName: AppConfig.report.defaultFileName + '.pdf'
            },

            /* Document-oriented font & format dropdowns. */
            fontFamily: {
                default: 'Segoe UI',
                items: [
                    { text: 'Segoe UI', value: 'Segoe UI' },
                    { text: 'Arial', value: 'Arial,Helvetica,sans-serif' },
                    { text: 'Georgia', value: 'Georgia,serif' },
                    { text: 'Times New Roman', value: 'Times New Roman,Times,serif' },
                    { text: 'Verdana', value: 'Verdana,Geneva,sans-serif' }
                ]
            },
            format: {
                default: 'Paragraph',
                types: [
                    { text: 'Paragraph', value: 'P' },
                    { text: 'Heading 1', value: 'H1' },
                    { text: 'Heading 2', value: 'H2' },
                    { text: 'Heading 3', value: 'H3' }
                ]
            },

            /* Step 2 / Step 5 - status feedback for the native export
               requests (fires before the service call goes out). */
            documentExporting: function (args) {
                setStatus('Requesting ' + (args && args.type ? args.type : 'document')
                    + ' export from the service&hellip;');
            },

            quickToolbarSettings: {
                enable: true,
                actionOnScroll: 'none',
                image: ['Replace', 'Align', 'Dimension', 'AltText', 'Remove', '|',
                    'InsertLink', 'OpenImageLink', 'RemoveImageLink'],
                link: ['Open', 'Edit', 'UnLink'],
                table: ['TableHeader', 'TableRemove', '|', 'TableRows', 'TableColumns', '|',
                    'Alignments', 'BackgroundColor']
            },

            tableSettings: {
                width: '100%',
                minWidth: 0,
                maxWidth: null,
                resize: true,
                styles: [
                    { text: 'Dashed Borders', command: 'Table', subCommand: 'Dashed' },
                    { text: 'Alternate Rows', command: 'Table', subCommand: 'Alternate' }
                ]
            },

            enableHtmlSanitizer: true,
            showTooltip: true,
            saveInterval: AppConfig.saveIntervalMs,
            height: '560px',
            placeholder: 'Click "Create New Report" to start, or type to begin from scratch.',

            /* Lifecycle events ------------------------------------------ */
            created: function () {
                rte = editor;
                updatePreview();
                setStatus('Editor ready.');
                bindActions();
            },

            /* Fires every saveInterval while typing: drives autosave and
               keeps the Step 4 preview in sync. */
            change: function () {
                saveDraft(true);
                updatePreview();
            },

            actionComplete: function () {
                updatePreview();
            },
            height: "1000px"
        });

        editor.appendTo('#esgEditor');
        return editor;
    }

    /* ------------------------------------------------------------------ */
    /* Action bar wiring                                                   */
    /* ------------------------------------------------------------------ */

    function confirmReplaceContent() {
        /* Prefer a lightweight confirm for the POC; swap for a styled
           dialog component when moving to production. */
        return window.confirm(
            'This will replace the current report content with the ESG template.\n' +
            'Unsaved changes will be lost. Continue?'
        );
    }

    /**
     * Triggers an inbuilt RTE toolbar tool programmatically (e.g. ExportWord /
     * ExportPdf). The ES5 global build exposes these as toolbar tools rather
     * than instance methods, so the header buttons delegate to the built-in
     * tool exactly as a toolbar click would — still 100% inbuilt behaviour.
     * Overflow tools are pre-rendered in the hidden toolbar popup (which lives
     * under .e-rte-toolbar, outside the .e-rte content root), so a plain
     * .click() works without opening the overflow first.
     * @param {string} title Tooltip title of the toolbar item.
     */
    function triggerToolbarTool(title) {
        var items = document.querySelectorAll('.e-rte-toolbar [title="' + title + '"]');
        if (!items || items.length === 0) { return false; }
        items[items.length - 1].click();
        return true;
    }

    function bindActions() {
        /* Step 1 - load the predefined ESG template. */
        els.btnCreateNew.onclick = function () {
            if (rte && rte.getHtml() && rte.getHtml().trim() !== '' && !confirmReplaceContent()) {
                return;
            }
            rte.value = EsgTemplate.getStartHtml(AppConfig.prefillSampleData);
            /* Apply the pending property change, then refresh the view. */
            rte.dataBind && rte.dataBind();
            rte.refreshUI && rte.refreshUI();
            /* Re-read after the asynchronous property pipeline settles. */
            setTimeout(function () {
                updatePreview();
                saveDraft(true);
                setStatus('ESG template loaded. Format the sections, insert KPI tables, and add evidence.');
            }, 250);
        };

        /* Manual save button. */
        els.btnSaveDraft.onclick = function () {
            saveDraft(false);
        };

        /* Step 5 - inbuilt RTE exports (service-backed .docx / .pdf). */
        els.btnExportWord.onclick = function () {
            if (!triggerToolbarTool('Export to Word')) {
                setStatus('<span class="status-warn">Export tool unavailable.</span>');
            }
        };

        els.btnExportPdf.onclick = function () {
            if (!triggerToolbarTool('Export to PDF')) {
                setStatus('<span class="status-warn">Export tool unavailable.</span>');
            }
        };

        /* Safety net autosave before unload. */
        window.addEventListener('beforeunload', function () {
            saveDraft(true);
        });
    }

    /* ------------------------------------------------------------------ */
    /* Boot                                                                */
    /* ------------------------------------------------------------------ */

    function init() {
        els.statusText = $('draftStatusText');
        els.savedAt = $('draftSavedAt');
        els.previewContent = $('previewContent');
        els.btnCreateNew = $('btnCreateNew');
        els.btnSaveDraft = $('btnSaveDraft');
        els.btnExportWord = $('btnExportWord');
        els.btnExportPdf = $('btnExportPdf');

        var draft = EsgStorage.load();
        var initialValue = '';
        if (draft && draft.html) {
            initialValue = draft.html;
            setSavedAt(draft.savedAt);
        }

        createEditor(initialValue);

        if (draft && draft.html) {
            setStatus('Draft restored from ' + new Date(draft.savedAt).toLocaleString()
                + '. Click "Create New Report" to start over.');
        } else {
            setStatus('No saved draft found. Click "Create New Report" to load the ESG template.');
        }
    }

    /* ES5-safe DOM ready. */
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 1);
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
