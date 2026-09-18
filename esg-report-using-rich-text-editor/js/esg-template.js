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
     * toolbar can format and restyle.
     */
    var TEMPLATE_HTML = ''
        + '<h1 style="text-align:center;">ESG Annual Report 2025</h1>'
        + '<p style="text-align:center;"><em>Company Name &ndash; Fiscal Year 2025</em></p>'
        + '<hr />'
        + '<h2>1. Environmental</h2>'
        + '<ul>'
        + '    <li><strong>Carbon Emissions:</strong>&nbsp;</li>'
        + '    <li><strong>Energy Consumption:</strong>&nbsp;</li>'
        + '    <li><strong>Renewable Energy Usage:</strong>&nbsp;</li>'
        + '</ul>'
        + '<h2>2. Social</h2>'
        + '<ul>'
        + '    <li><strong>Employee Count:</strong>&nbsp;</li>'
        + '    <li><strong>Diversity &amp; Inclusion Initiatives:</strong>&nbsp;</li>'
        + '    <li><strong>Community Programs:</strong>&nbsp;</li>'
        + '</ul>'
        + '<h2>3. Governance</h2>'
        + '<ul>'
        + '    <li><strong>Board Composition:</strong>&nbsp;</li>'
        + '    <li><strong>Compliance Activities:</strong>&nbsp;</li>'
        + '    <li><strong>Risk Management Measures:</strong>&nbsp;</li>'
        + '</ul>'
        + '<hr />'
        + '<p><em>Add KPI tables, evidence images, and framework references to complete the report.</em></p>';

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
        + '<h1 style="text-align:center; color:#1F6E43;">ESG Annual Report 2025</h1>'
        + '<p style="text-align:center;"><strong>Verdant Industries</strong> &ndash; Fiscal Year 2025<br />'
        + '<em>Sustainable growth, accountable business</em></p>'
        + '<hr />'
        + '<h2>1. Environmental</h2>'
        + '<ul>'
        + '    <li><strong>Carbon Emissions:</strong> Reduced absolute Scope 1 &amp; 2 emissions from <span style="color:#B3261E;">1200 tCO\u2082 (2024)</span> to <span style="color:#1F6E43;">950 tCO\u2082 (2025)</span>.</li>'
        + '    <li><strong>Energy Consumption:</strong> Total consumption fell 8% year-on-year through efficiency retrofits.</li>'
        + '    <li><strong>Renewable Energy Usage:</strong> Increased from 45% to 60% of total electricity mix.</li>'
        + '</ul>'
        + '<h3>KPI Highlights</h3>'
        + '<table class="kpi-table" style="width:100%; border-collapse:collapse;" border="1">'
        + '    <thead>'
        + '        <tr>'
        + '            <th style="padding:6px 10px; background:#EAF4EE;">KPI</th>'
        + '            <th style="padding:6px 10px; background:#EAF4EE;">2024</th>'
        + '            <th style="padding:6px 10px; background:#EAF4EE;">2025</th>'
        + '        </tr>'
        + '    </thead>'
        + '    <tbody>'
        + '        <tr>'
        + '            <td style="padding:6px 10px;">Carbon Emissions</td>'
        + '            <td style="padding:6px 10px;">1200 tCO\u2082</td>'
        + '            <td style="padding:6px 10px;">950 tCO\u2082</td>'
        + '        </tr>'
        + '        <tr>'
        + '            <td style="padding:6px 10px;">Renewable Energy</td>'
        + '            <td style="padding:6px 10px;">45%</td>'
        + '            <td style="padding:6px 10px;">60%</td>'
        + '        </tr>'
        + '    </tbody>'
        + '</table>'
        + '<h2>2. Social</h2>'
        + '<ul>'
        + '    <li><strong>Employee Count:</strong> 1,240 employees across 6 sites (+7% YoY).</li>'
        + '    <li><strong>Diversity &amp; Inclusion Initiatives:</strong> Launched mentoring circles; women in leadership rose to 38%.</li>'
        + '    <li><strong>Community Programs:</strong> 12,000 volunteer hours; STEM partnerships in 3 regions.</li>'
        + '</ul>'
        + '<h2>3. Governance</h2>'
        + '<ul>'
        + '    <li><strong>Board Composition:</strong> 9 members, 44% independent, 33% women.</li>'
        + '    <li><strong>Compliance Activities:</strong> Zero material findings; 100% completion of ethics training.</li>'
        + '    <li><strong>Risk Management Measures:</strong> Introduced quarterly climate-risk reviews at board level.</li>'
        + '</ul>'
        + '<h3>References</h3>'
        + '<ul>'
        + '    <li><a href="https://www.globalreporting.org/standards/" target="_blank" rel="noopener">GRI Standards</a> &ndash; reporting framework alignment (opens in new window).</li>'
        + '    <li><a href="https://sasb.org/" target="_blank" rel="noopener">SASB Standards</a> &ndash; industry metrics.</li>'
        + '    <li><a href="https://www.tcfdhub.org/" target="_blank" rel="noopener">TCFD</a> &ndash; climate-related disclosures.</li>'
        + '</ul>'
        + '<h3>Certifications &amp; Evidence</h3>'
        + '<p style="text-align:center;">'
        + '    <img src="assets/esg-cert-badge.svg" alt="ESG certification badge" width="140" height="140" style="display:inline;" />'
        + '</p>'
        + '<hr />'
        + '<p><em>Prepared by the Sustainability Office &middot; Demo content illustrating the report structure. All figures are sample data.</em></p>';

    return {
        HTML: TEMPLATE_HTML,
        SAMPLE_HTML: SAMPLE_HTML,

        /**
         * Returns the starting HTML for a new report.
         * @param {boolean} prefill When true, returns the sample-filled template.
         * @return {string}
         */
        getStartHtml: function (prefill) {
            return prefill ? SAMPLE_HTML : TEMPLATE_HTML;
        }
    };
})();
