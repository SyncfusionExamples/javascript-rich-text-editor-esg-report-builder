/* ============================================================================
   ESG_Report_RTE - ESG report template + sample content
   Plain JavaScript ES5.

   Provides:
     EsgTemplate.HTML        - blank canonical ESG template (Step 1)
     EsgTemplate.SAMPLE_HTML - template pre-filled with editable demo content
   ========================================================================== */

var EsgTemplate = (function () {

    /**
     * Canonical ESG report template. Structure per POC spec:
     * three pillar sections (Environmental / Social / Governance), each with
     * its standard disclosure bullet list, plus heading hierarchy the RTE
     * toolbar can format and restyle. Body keeps {{FieldName}} tokens as
     * placeholders for the mail-merge workflow.
     */
    var TEMPLATE_HTML = ''
        + '<p style="text-align:center;"><img src="assets/esg-logo.svg" alt="Company logo" width="96" height="96" style="display:inline;" /></p>'
        + '<h1 style="text-align:center; color:#1F6E43;">ESG Annual Report {{ReportingPeriod}}</h1>'
        + '<p style="text-align:center;">For <strong>{{RecipientName}}</strong> &middot; <strong>{{CompanyName}}</strong> &middot; <em>{{Framework}} framework</em></p>'
        + '<hr/>'
        + '<h2>1. Environmental</h2>'
        + '<ul>'
        + '    <li><strong>Scope 1 emissions:</strong>&nbsp;{{Scope1}}</li>'
        + '    <li><strong>Scope 2 emissions:</strong>&nbsp;{{Scope2}}</li>'
        + '    <li><strong>Renewable electricity:</strong>&nbsp;{{RenewablePct}}</li>'
        + '    <li><strong>Energy Consumption:</strong>&nbsp;tracked against roadmap</li>'
        + '</ul>'
        + '<h2>2. Social</h2>'
        + '<ul>'
        + '    <li><strong>Employee Count:</strong>&nbsp;{{Employees}}</li>'
        + '    <li><strong>Diversity &amp; Inclusion Initiatives:</strong>&nbsp;mentoring circles and leadership programs</li>'
        + '    <li><strong>Community Programs:</strong>&nbsp;regional volunteering and STEM partnerships</li>'
        + '</ul>'
        + '<h2>3. Governance</h2>'
        + '<ul>'
        + '    <li><strong>Board Independence:</strong>&nbsp;{{BoardIndep}}</li>'
        + '    <li><strong>Compliance Activities:</strong>&nbsp;zero material findings; ethics training completed</li>'
        + '    <li><strong>Risk Management Measures:</strong>&nbsp;quarterly climate-risk reviews at board level</li>'
        + '</ul>'
        + '<p><em>Report date: {{ReportDate}}</em></p>'
        + '<hr/>'
        + '<p><em>Use the <strong>Insert Field</strong> drop-down (or press {{ in the editor) to add new merge fields, then click <strong>Merge Document</strong> to expand them across records.</em></p>';

    /**
     * Demo content pre-filled into the template. Everything remains fully
     * editable inside the RTE. Demonstrates:
     *  - headings & structure           (Step 1)
     *  - bold text, colored text       (Step 2)
     *  - KPI table with 2024/2025 data (Step 2)
     *  - hyperlinks to ESG references   (Step 2)
     *  - logo + certification evidence  (Step 3)
     */
    var SAMPLE_HTML = ''
        + '<p style="text-align:center;"><img src="assets/esg-logo.svg" alt="Company logo" width="96" height="96" style="display:inline;" /></p>'
        + '<h1 style="text-align:center; color:#1F6E43;">{{CompanyName}} ESG Report &mdash; {{ReportingPeriod}}</h1>'
        + '<p style="text-align:center;"><strong>Prepared for {{RecipientName}}</strong> &middot; <em>{{Framework}} framework ({{Region}} scope)</em></p>'
        + '<hr/>'
        + '<p><strong>Dear {{RecipientName}},</strong></p>'
        + '<p>This is {{CompanyName}}\'s ESG disclosure for {{ReportingPeriod}}, prepared using the {{Framework}} framework and covering {{Region}} operations.</p>'
        + '<h2>1. Environmental</h2>'
        + '<ul>'
        + '    <li><strong>Scope 1 emissions:</strong>&nbsp;{{Scope1}} (down vs. FY2024 baseline).</li>'
        + '    <li><strong>Scope 2 emissions:</strong>&nbsp;{{Scope2}} (market-based).</li>'
        + '    <li><strong>Renewable electricity:</strong>&nbsp;{{RenewablePct}} of total electricity mix.</li>'
        + '    <li><strong>Energy Consumption:</strong> Total fell 8% year-on-year through efficiency retrofits.</li>'
        + '</ul>'
        + '<h3>KPI Highlights</h3>'
        + '<table class="kpi-table" style="width:100%; border-collapse:collapse;" border="1">'
        + '    <thead>'
        + '        <tr>'
        + '            <th style="padding:6px 10px; background:#EAF4EE;">KPI</th>'
        + '            <th style="padding:6px 10px; background:#EAF4EE;">FY2024</th>'
        + '            <th style="padding:6px 10px; background:#EAF4EE;">{{ReportingPeriod}}</th>'
        + '        </tr>'
        + '    </thead>'
        + '    <tbody>'
        + '        <tr>'
        + '            <td style="padding:6px 10px;">Carbon Emissions (Scope 1 + 2)</td>'
        + '            <td style="padding:6px 10px;">1200 tCO\u2082</td>'
        + '            <td style="padding:6px 10px;">950 tCO\u2082</td>'
        + '        </tr>'
        + '        <tr>'
        + '            <td style="padding:6px 10px;">Renewable Energy</td>'
        + '            <td style="padding:6px 10px;">45%</td>'
        + '            <td style="padding:6px 10px;">60%</td>'
        + '        </tr>'
        + '        <tr>'
        + '            <td style="padding:6px 10px;">Employees</td>'
        + '            <td style="padding:6px 10px;">1,210</td>'
        + '            <td style="padding:6px 10px;">{{Employees}}</td>'
        + '        </tr>'
        + '        <tr>'
        + '            <td style="padding:6px 10px;">Board Independence</td>'
        + '            <td style="padding:6px 10px;">52%</td>'
        + '            <td style="padding:6px 10px;">{{BoardIndep}}</td>'
        + '        </tr>'
        + '    </tbody>'
        + '</table>'
        + '<h2>2. Social</h2>'
        + '<ul>'
        + '    <li><strong>Employee Count:</strong>&nbsp;{{Employees}} colleagues across reporting boundary (+7% YoY).</li>'
        + '    <li><strong>Diversity &amp; Inclusion Initiatives:</strong> Mentoring circles; women in leadership rose to 38%.</li>'
        + '    <li><strong>Community Programs:</strong> 12,000 volunteer hours; STEM partnerships in 3 regions.</li>'
        + '</ul>'
        + '<h2>3. Governance</h2>'
        + '<ul>'
        + '    <li><strong>Board Composition:</strong>{{BoardIndep}} independent members, 33% women.</li>'
        + '    <li><strong>Compliance Activities:</strong> Zero material findings; 100% completion of ethics training.</li>'
        + '    <li><strong>Risk Management Measures:</strong> Introduced quarterly climate-risk reviews at board level.</li>'
        + '</ul>'
        + '<h3>References</h3>'
        + '<h3>Certifications &amp; Evidence</h3>'
        + '<p style="text-align:center;">'
        + '    <img src="assets/esg-cert-badge.svg" alt="ESG certification badge" width="140" height="140" style="display:inline;" />'
        + '</p>'
        + '<hr/>'
        + '<p><em>Report generated on {{ReportDate}}. All figures are sample data.</em></p>';

    /* ------------------------------------------------------------------
       Returns the starting HTML for a new report.
       Placeholders are kept as {{FieldName}} tokens so authors see the
       merge syntax and click Merge Document to expand them across records.
       The first sample record is only used to seed the default values
       used by the editor placeholder text (not the template body).
       ------------------------------------------------------------------ */
    return {
        HTML: TEMPLATE_HTML,
        SAMPLE_HTML: SAMPLE_HTML,

        /**
         * Returns the starting HTML for a new report.
         * The body keeps {{FieldName}} tokens intact so the mail-merge
         * workflow is visible from first load. Authors click Merge Document
         * (or pick a field from Insert Field) to expand them.
         * @param {boolean} prefill When true, returns the rich sample template.
         * @return {string}
         */
        getStartHtml: function (prefill) {
            return prefill ? SAMPLE_HTML : TEMPLATE_HTML;
        }
    };
})();
