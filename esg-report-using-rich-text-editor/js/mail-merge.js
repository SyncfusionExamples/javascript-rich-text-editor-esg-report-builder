/* ============================================================================
   ESG_Report_RTE - Mail merge data + field catalog (ES5)

   Exposes a single MailMerge namespace used by app.js to:
     - enumerate available fields (FIELDS)
     - hold the sample data set (SAMPLE_RECORDS, currentData())
     - plug real records from the live ESG form (bindFromMetrics)
     - perform client-side field expansion against the RTE value (applyMerge)
     - surface useful helpers (formatNumber, escapeHtml, tokenRegex)

   The file is plain ES5 (var, function, string concatenation), matches the
   conventions used in the rest of the POC and is loaded before app.js so
   MailMerge is globally available at editor bootstrap time.
   ============================================================================ */

var MailMerge = (function () {

    /* Field catalog used by:
       - the Insert Field DropDownButton in the toolbar
       - the {{ ... }} Mention trigger
       - the placeholder demo text inside EsgTemplate.
       Keep the field names identical across the RTE and DOCX POC so that the
       same backing sample data set can be shared. */
    var FIELDS = [
        { text: "Recipient Name",       value: "RecipientName" },
        { text: "Company",              value: "CompanyName" },
        { text: "Reporting Period",     value: "ReportingPeriod" },
        { text: "Framework",            value: "Framework" },
        { text: "Region / Scope",       value: "Region" },
        { text: "Scope 1 Emissions",    value: "Scope1" },
        { text: "Scope 2 Emissions",    value: "Scope2" },
        { text: "Renewable Energy %",   value: "RenewablePct" },
        { text: "Employees",            value: "Employees" },
        { text: "Board Independence %", value: "BoardIndep" },
        { text: "Reporting Date",       value: "ReportDate" }
    ];

    /* Static demo records (one per recipient). The first record doubles as
       the "current" data set so the preview reflects the @RTE value as-is
       until the user clicks Merge Document. */
    var SAMPLE_RECORDS = [
        {
            RecipientName: "Anna Schmidt",
            CompanyName: "Northwind Industries Ltd.",
            ReportingPeriod: "FY 2025",
            Framework: "GRI",
            Region: "Europe",
            Scope1: "18,540 tCO\u2082e",
            Scope2: "9,210 tCO\u2082e",
            RenewablePct: "68.5%",
            Employees: "12,480",
            BoardIndep: "58.3%",
            ReportDate: "September 21, 2026"
        },
        {
            RecipientName: "Carlos Pereira",
            CompanyName: "Verdant Industries",
            ReportingPeriod: "FY 2025",
            Framework: "CSRD/ESRS",
            Region: "Global",
            Scope1: "21,030 tCO\u2082e",
            Scope2: "10,840 tCO\u2082e",
            RenewablePct: "72.1%",
            Employees: "9,260",
            BoardIndep: "61.7%",
            ReportDate: "September 21, 2026"
        },
        {
            RecipientName: "Priya Raman",
            CompanyName: "Helios Manufacturing",
            ReportingPeriod: "FY 2025",
            Framework: "SASB",
            Region: "Asia Pacific",
            Scope1: "27,915 tCO\u2082e",
            Scope2: "13,640 tCO\u2082e",
            RenewablePct: "54.8%",
            Employees: "18,920",
            BoardIndep: "49.6%",
            ReportDate: "September 21, 2026"
        }
    ];

    var current = SAMPLE_RECORDS.slice();

    /* Helpers ---------------------------------------------------------- */

    function escapeHtml(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /* Public: build a record from the live ESG metric inputs (sidebar). The
       RTE POC stores values either on AppConfig.company (defaults) or in
       input fields. The DOCX POC exposes the same shape via mail-merge.js. */
    function buildRecordFromMetrics(metrics, defaults) {
        defaults = defaults || {};
        var m = metrics || {};
        return {
            RecipientName:  defaults.recipientName || defaults.RecipientName || "Sustainability Lead",
            CompanyName:    m.company    || defaults.company   || "Your Company",
            ReportingPeriod:m.period     || defaults.period    || "FY 2025",
            Framework:      m.framework  || defaults.framework || "GRI",
            Region:         m.region     || defaults.region    || "Global",
            Scope1:         formatNumber(m.scope1,    " tCO\u2082e"),
            Scope2:         formatNumber(m.scope2,    " tCO\u2082e"),
            RenewablePct:   formatNumber(m.renew,     "%", 1),
            Employees:      formatNumber(m.employees, "", 0),
            BoardIndep:     formatNumber(m.board,     "%", 1),
            ReportDate:     new Date().toLocaleDateString("en-GB",
                            { year: "numeric", month: "long", day: "numeric" })
        };
    }

    function formatNumber(v, suffix, decimals) {
        decimals = (decimals === undefined) ? 0 : decimals;
        if (v === null || v === undefined || v === "") { return ""; }
        var n = Number(v);
        if (isNaN(n)) { return String(v); }
        var body = (decimals === 0)
            ? Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return body + (suffix || "");
    }

    /* Public: replace every {{FieldName}} token in arbitrary markup.
       Unknown tokens are preserved so the user sees them on output. */
    function expandTokens(markup, record) {
        if (!markup) { return ""; }
        var bag = record || {};
        return String(markup).replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, function (_, key) {
            return bag[key] != null ? String(bag[key]) : "{{" + key + "}}";
        });
    }

    /* Public: render the RTE value once per record and return a single
       concatenated HTML string suitable for rte.value = ... */
    function buildMergedHtml(rteHtml, record) {
        var safe = expandTokens(rteHtml, record);
        var header = '<p style="font-size:11px;color:#4A5A66;margin:0 0 8px;">'
                   + 'Record for <strong>' + escapeHtml(record.RecipientName || "Unknown") + '</strong>'
                   + '</p>';
        return header + safe + '<hr/>';
    }

    /* Public: build records from an arbitrary array (used by applyMerge). */
    function asRecords(arr) {
        return (arr && arr.length) ? arr.slice() : current.slice();
    }

    /* Public: apply merge to the editor instance. Returns the number of
       records applied. */
    function applyMerge(rteInstance, options) {
        if (!rteInstance) { return 0; }
        options = options || {};
        var html = (typeof rteInstance.getHtml === "function") ? rteInstance.getHtml() : "";
        var records = options.records || current;
        if (!records.length) { return 0; }
        var out = records.map(function (rec) { return buildMergedHtml(html, rec); }).join("");
        if (rteInstance.value !== undefined) { rteInstance.value = out; }
        if (typeof rteInstance.dataBind === "function") { rteInstance.dataBind(); }
        return records.length;
    }

    /* Public: refresh the in-store current record set. */
    function setCurrentRecords(arr) {
        if (!arr || !arr.length) { return current; }
        current = arr.slice();
        return current;
    }

    function getCurrentRecords() { return current.slice(); }

    return {
        FIELDS: FIELDS,
        SAMPLE_RECORDS: SAMPLE_RECORDS,
        fieldValues:   FIELDS.map(function (f) { return f.value; }),
        fieldLabels:   FIELDS.map(function (f) { return f.text; }),
        getCurrentRecords: getCurrentRecords,
        setCurrentRecords: setCurrentRecords,
        buildRecordFromMetrics: buildRecordFromMetrics,
        expandTokens: expandTokens,
        buildMergedHtml: buildMergedHtml,
        applyMerge: applyMerge,
        asRecords: asRecords,
        formatNumber: formatNumber,
        escapeHtml: escapeHtml
    };
})();