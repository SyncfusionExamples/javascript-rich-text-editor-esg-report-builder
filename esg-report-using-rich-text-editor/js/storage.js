/* ============================================================================
   ESG_Report_RTE - Draft persistence layer (localStorage autosave)
   Plain JavaScript ES5.

   EsgStorage API:
     save(html)          - persist draft (catches quota errors, returns bool)
     load()              - returns {html, savedAt, revision} or null
     clear()             - removes the draft
     hasDraft()          - quick check
     estimateFootprint() - rough size of the stored draft in KB (diagnostics)
   ========================================================================== */

var EsgStorage = (function () {

    var KEY_HTML = AppConfig.storageKey;
    var KEY_META = AppConfig.metaKey;

    /** Non-fatal error logger; swap for telemetry in production. */
    function logError(scope, err) {
        if (window.console && console.error) {
            console.error('[EsgStorage:' + scope + ']', err);
        }
    }

    return {

        /**
         * Persists the report HTML plus metadata.
         * Base64-encoded images can exceed the ~5MB localStorage quota;
         * quota failures are reported to the caller (never thrown).
         * @param {string} html
         * @return {boolean} true when saved successfully.
         */
        save: function (html) {
            try {
                var prevMeta = null;
                try { prevMeta = JSON.parse(window.localStorage.getItem(KEY_META) || 'null'); }
                catch (parseErr) { prevMeta = null; }

                var revision = (prevMeta && prevMeta.revision ? prevMeta.revision : 0) + 1;

                window.localStorage.setItem(KEY_HTML, html);
                window.localStorage.setItem(KEY_META, JSON.stringify({
                    savedAt: new Date().getTime(),
                    revision: revision
                }));
                return true;
            } catch (err) {
                // QuotaExceededError (large Base64 images) or storage disabled.
                logError('save', err);
                return false;
            }
        },

        /**
         * Loads the persisted draft, if any.
         * @return {Object|null} {html:string, savedAt:number, revision:number}
         */
        load: function () {
            try {
                var html = window.localStorage.getItem(KEY_HTML);
                if (!html) { return null; }
                var meta = null;
                try { meta = JSON.parse(window.localStorage.getItem(KEY_META) || 'null'); }
                catch (parseErr) { meta = null; }
                return {
                    html: html,
                    savedAt: meta ? meta.savedAt : null,
                    revision: meta ? meta.revision : null
                };
            } catch (err) {
                logError('load', err);
                return null;
            }
        },

        /** Removes the draft and its metadata. */
        clear: function () {
            try {
                window.localStorage.removeItem(KEY_HTML);
                window.localStorage.removeItem(KEY_META);
            } catch (err) {
                logError('clear', err);
            }
        },

        /** @return {boolean} true when a draft exists. */
        hasDraft: function () {
            try {
                return window.localStorage.getItem(KEY_HTML) !== null;
            } catch (err) {
                return false;
            }
        },

        /**
         * Rough stored size in KB — useful when diagnosing quota pressure
         * caused by Base64-encoded evidence images.
         * @return {number}
         */
        estimateFootprint: function () {
            try {
                var html = window.localStorage.getItem(KEY_HTML) || '';
                return Math.round((html.length + (window.localStorage.getItem(KEY_META) || '').length) / 1024);
            } catch (err) {
                return 0;
            }
        }
    };
})();
