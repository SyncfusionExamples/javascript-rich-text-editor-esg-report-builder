/* ============================================================================
   ESG_Report_RTE - Application configuration
   Plain JavaScript ES5. No modules, no build step.

   IMPORTANT: Keep this file ES5-only (var, function, string concatenation).
   ========================================================================== */

/**
 * Central application configuration. Everything an integrator needs to
 * re-point (storage keys, export service, branding) lives here.
 */
var AppConfig = (function () {

    /** Syncfusion EJ2 version pinned in index.html (CDN). */
    var EJ2_VERSION = '34.2.2';

    return {
        /** EJ2 CDN version (informational; scripts are referenced in index.html). */
        ej2Version: EJ2_VERSION,

        /** localStorage key used for the autosaved draft. */
        storageKey: 'rte-esg.report.html',

        /** localStorage key used for draft metadata (saved timestamp, revision). */
        metaKey: 'rte-esg.report.meta',

        /** Editable company identity shown in the report header band. */
        company: {
            name: 'Verdant Industries',
            tagline: 'Sustainable growth, accountable business',
            logoClass: 'esg-logo',
            logoSrc: 'assets/esg-logo.svg'
        },

        /** Report metadata used for titles and export file names. */
        report: {
            title: 'ESG Annual Report 2025',
            defaultFileName: 'ESG-Annual-Report-2025'
        },

        /**
         * Document services behind the RTE's inbuilt Import/Export and
         * image-upload features (Syncfusion-hosted sample service).
         * Swap baseUrl with your own deployment of the Syncfusion server-side
         * converter (ASP.NET Core / ASP.NET MVC / Java) for production.
         */
        services: {
            baseUrl: 'https://services.syncfusion.com/js/production/',
            imageSavePath: 'api/RichTextEditor/SaveFile',
            imageRemovePath: 'api/RichTextEditor/DeleteFile',
            imagePath: 'RichTextEditor/',
            importWordPath: 'api/RichTextEditor/ImportFromWord',
            exportWordPath: 'api/RichTextEditor/ExportToDocx',
            exportPdfPath: 'api/RichTextEditor/ExportToPdf'
        },

        /** Autosave cadence. Also drives how often the preview refreshes. */
        saveIntervalMs: 500,

        /** Sample-data mode: prefill the template with demo content (POC default). */
        prefillSampleData: true
    };
})();
