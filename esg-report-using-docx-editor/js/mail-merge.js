/* ============================================================================
   ESG Report Builder (DOCX Editor) - Mail merge module (ES5)

   Provides a shared field catalog + sample records so the Merge Document
   logic in esg-app.js can:
     - enumerate merge fields (MailMerge.FIELDS, MailMerge.fieldLabels,
       MailMerge.fieldValues)
     - drop a header for a record into the SFDT (headlinePara, closingPara)
     - build the records payload to send to /api/MailMerge
=========================================================================== */

var MailMerge = (function () {

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

    /* Build a single record from the live metrics in the sidebar and
       optional company defaults. Used when the user has typed values into
       the existing configuration bar. */
    function buildRecordFromMetrics(metrics, defaults) {
        defaults = defaults || {};
        var m = metrics || {};
        return {
            RecipientName: defaults.recipientName || defaults.RecipientName || "Sustainability Lead",
            CompanyName:   m.company   || defaults.company   || "Your Company",
            ReportingPeriod:m.period   || defaults.period    || "FY 2025",
            Framework:     m.framework || defaults.framework || "GRI",
            Region:        m.region    || defaults.region    || "Global",
            Scope1:        formatNumber(m.scope1,    " tCO\u2082e"),
            Scope2:        formatNumber(m.scope2,    " tCO\u2082e"),
            RenewablePct:  formatNumber(m.renew,     "%", 1),
            Employees:     formatNumber(m.employees, "", 0),
            BoardIndep:    formatNumber(m.board,     "%", 1),
            ReportDate:    new Date().toLocaleDateString("en-GB",
                            { year: "numeric", month: "long", day: "numeric" })
        };
    }

    return {
        FIELDS: FIELDS,
        fieldValues:   FIELDS.map(function (f) { return f.value; }),
        fieldLabels:   FIELDS.map(function (f) { return f.text; }),
        SAMPLE_RECORDS: SAMPLE_RECORDS,
        buildRecordFromMetrics: buildRecordFromMetrics,
        formatNumber: formatNumber
    };
})();