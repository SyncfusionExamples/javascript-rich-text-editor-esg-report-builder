/* ============================================================================
 * esg-app.js  (single bundled app script for the ESG Report Builder POC)
 * ----------------------------------------------------------------------------
 * Contains, in order:
 *   1. EsgData          - simulated ESG data warehouse
 *   2. EsgReportBuilder - builds an SFDT Word document from that data
 *   3. App bootstrap    - DocumentEditorContainer (Ribbon toolbar) + UI wiring
 *
 * Everything runs client-side; no build step and no server required.
 * ========================================================================== */

/* ========================================================================== */
/* 1. Simulated ESG data warehouse                                            */
/* ========================================================================== */
var EsgData = (function () {
    "use strict";

    var historical = {
        years: ["FY2021", "FY2022", "FY2023", "FY2024", "FY2025"],
        scope1: [24100, 22450, 21025, 19880, 18540],      // tCO2e
        scope2: [12850, 12025, 10810, 10005, 9210],       // tCO2e
        energy: [121300, 118900, 116400, 114200, 112400], // MWh
        renew: [41.0, 48.7, 55.3, 62.1, 68.5],            // % renewable
        training: [19.2, 21.5, 23.8, 25.9, 27.4],         // hrs/FTE
        ltifr: [3.12, 2.84, 2.51, 2.07, 1.84]             // per 1M hours
    };

    var sites = [
        { name: "Rotterdam Plant",        region: "Europe",        scope1: 3120, scope2: 1520, renew: 74.2 },
        { name: "Austin Innovation Hub",  region: "North America", scope1: 4260, scope2: 2510, renew: 61.8 },
        { name: "Shenzhen Assembly",      region: "Asia Pacific",  scope1: 5530, scope2: 3080, renew: 58.4 },
        { name: "Pune Tech Center",       region: "Asia Pacific",  scope1: 2210, scope2: 1105, renew: 49.6 },
        { name: "S\u00e3o Paulo Office",  region: "Global",        scope1: 1180, scope2: 640,  renew: 66.9 },
        { name: "Hamburg Logistics Hub", region: "Europe",        scope1: 2240, scope2: 355,  renew: 71.3 }
    ];

    return {
        historical: historical,
        filterSitesByRegion: function (region) {
            if (!region || region === "Global") { return sites.slice(); }
            return sites.filter(function (s) { return s.region === region; });
        }
    };
})();

/* ========================================================================== */
/* 2. SFDT report generator                                                   */
/* ========================================================================== */
var EsgReportBuilder = (function (data) {
    "use strict";

    if (!data) {
        throw new Error("EsgData is required.");
    }

    /* Theme palette (hex without #, alpha FF appended by c()) */
    var T = {
        primary: "0F4C3A",
        secondary: "2E7D32",
        accent: "66BB6A",
        accent2: "A7D7B4",
        amber: "D97706",
        slate: "64748B",
        border: "94A3B8",
        zebra: "F1F8F2",
        white: "FFFFFF",
        red: "B91C1C"
    };

    var PAGE_W = 595.3, PAGE_H = 841.9, MARGIN = 64;
    var CONTENT_W = PAGE_W - (MARGIN * 2);
    var FONT = "Calibri";
    var BODY_SIZE = 10.5;

    /* Formatting helpers */
    function thousands(n) {
        var v = Math.round(Math.abs(n));
        return (n < 0 ? "-" : "") + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function dec1(n) { return Number(n).toFixed(1); }
    function signed1(x) { return (x >= 0 ? "+" : "") + x.toFixed(1) + "%"; }
    function pctChange(prev, cur) { return prev ? ((cur - prev) / prev) * 100 : 0; }
    function nowStamp() {
        return new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
    }

    /* SFDT primitives */
    function c(hex) { return "#" + hex + "FF"; }

    function cf(o) {
        o = o || {};
        return {
            bold: !!o.bold,
            italic: !!o.italic,
            fontSize: o.fontSize === undefined ? BODY_SIZE : o.fontSize,
            fontFamily: o.fontFamily || FONT,
            fontColor: o.fontColor === undefined ? c("111827") : o.fontColor,
            underline: "None"
        };
    }

    function run(text, fmt) {
        return { characterFormat: cf(fmt || {}), text: String(text) };
    }

    function pf(o) {
        o = o || {};
        var base = {
            styleName: o.styleName || "Normal",
            listFormat: {},
            beforeSpacing: o.beforeSpacing === undefined ? 0 : o.beforeSpacing,
            afterSpacing: o.afterSpacing === undefined ? 8 : o.afterSpacing,
            lineSpacing: o.lineSpacing === undefined ? 1.15 : o.lineSpacing,
            lineSpacingType: "Multiple",
            textAlignment: o.textAlignment || "Left"
        };
        if (o.leftIndent !== undefined) { base.leftIndent = o.leftIndent; }
        if (o.firstLineIndent !== undefined) { base.firstLineIndent = o.firstLineIndent; }
        return base;
    }
    function para(inlines, o) {
        return { paragraphFormat: pf(o || {}), characterFormat: cf({}), inlines: inlines };
    }

    function spacer(pts) {
        return para([], { afterSpacing: pts === undefined ? 12 : pts, lineSpacing: 1 });
    }

    function body(parts, o) {
        o = o || {};
        o.textAlignment = o.textAlignment || "Justify";
        var inlines = typeof parts === "string" ? [run(parts)] : parts;
        return para(inlines, o);
    }

    function heading(level, text) {
        return para([run(text, { bold: true })], {
            styleName: "Heading " + level,
            beforeSpacing: level === 1 ? 16 : 12,
            afterSpacing: 6,
            lineSpacing: 1.1
        });
    }

    function bullet(text) {
        var b = para([run("\u2022  " + text)], {
            textAlignment: "Justify",
            afterSpacing: 4,
            leftIndent: 18
        });
        b.paragraphFormat.firstLineIndent = -18;
        return b;
    }

    function caption(text) {
        return para([run(text, { italic: true, fontSize: 9, fontColor: c(T.slate) })], {
            textAlignment: "Center",
            beforeSpacing: 4,
            afterSpacing: 14
        });
    }

    function bkmkStart(name) { return { characterFormat: cf({}), name: name, bookmarkType: 0 }; }
    function bkmkEnd(name)   { return { characterFormat: cf({}), name: name, bookmarkType: 1 }; }

    /* Borders / tables */
    function b(lineStyle, width, color) {
        return { color: color, hasNoneStyle: lineStyle === "None", lineStyle: lineStyle, lineWidth: width, shadow: false, space: 0 };
    }
    var NO_BORDERS = {
        top: b("None", 0, c("FFFFFF")), left: b("None", 0, c("FFFFFF")),
        right: b("None", 0, c("FFFFFF")), bottom: b("None", 0, c("FFFFFF")),
        diagonalDown: b("None", 0, c("FFFFFF")), diagonalUp: b("None", 0, c("FFFFFF")),
        horizontal: b("None", 0, c("FFFFFF")), vertical: b("None", 0, c("FFFFFF"))
    };
    function dataTableBorders() {
        var inner = b("Single", 0.5, c(T.border));
       return Object.assign({}, NO_BORDERS, {
            top: b("Single", 1, c(T.primary)),
            left: b("Single", 0.5, c(T.border)),
            right: b("Single", 0.5, c(T.border)),
            bottom: b("Single", 1, c(T.primary)),
            horizontal: inner, vertical: inner
        });
    }

    function cell(content, widthPct, fillHex, colIndex, opts) {
        opts = opts || {};
        var blocks = [];
        if (typeof content === "string") {
            blocks.push(para([run(content, {
                bold: !!opts.bold,
                fontColor: opts.fontColor || c("1F2937"),
                fontSize: opts.fontSize || 9.5
            })], { afterSpacing: 0, lineSpacing: 1.1 }));
        } else {
            for (var i = 0; i < content.length; i++) { blocks.push(content[i]); }
        }
        return {
            blocks: blocks,
            cellFormat: {
                borders: NO_BORDERS,
                shading: { backgroundColor: c(fillHex || "FFFFFF"), foregroundColor: "empty", textureStyle: "TextureNone" },
                preferredWidth: widthPct,
                preferredWidthType: "Percent",
                cellWidth: Math.round(CONTENT_W * widthPct) / 100,
                columnSpan: 1,
                rowSpan: 1,
                verticalAlignment: opts.valign || "Top"
            },
            columnIndex: colIndex
        };
    }

    function row(cells, opts) {
        opts = opts || {};
        return {
            cells: cells,
            rowFormat: {
                height: opts.height === undefined ? 22 : opts.height,
                allowBreakAcrossPages: true,
                heightType: "AtLeast",
                isHeader: !!opts.isHeader,
                borders: NO_BORDERS,
                gridBefore: 0, gridBeforeWidth: 0, gridBeforeWidthType: "Point",
                gridAfter: 0, gridAfterWidth: 0, gridAfterWidthType: "Point"
            }
        };
    }

    function tableBlock(headers, rows, widths) {
        var allRows = [];
        var i, j;

        var hCells = [];
        for (i = 0; i < headers.length; i++) {
            hCells.push(cell(headers[i], widths[i], T.primary, i, {
                bold: true, fontColor: c(T.white), valign: "Center"
            }));
        }
        allRows.push(row(hCells, { isHeader: true, height: 24 }));

        for (i = 0; i < rows.length; i++) {
            var r = rows[i];
            var fill = r.zebra ? T.zebra : T.white;
            var rCells = [];
            for (j = 0; j < r.cells.length; j++) {
                rCells.push(cell(r.cells[j], widths[j], fill, j, { bold: !!r.bold }));
                if (j > 0) {
                    rCells[j].blocks[0].paragraphFormat.textAlignment = "Right";
                }
            }
            allRows.push(row(rCells, r.isTotal ? { height: 24 } : {}));
        }

        var grid = [];
        for (i = 0; i < widths.length; i++) {
            grid.push(Math.round(CONTENT_W * widths[i]) / 100);
        }

        return {
            rows: allRows,
            grid: grid,
            tableFormat: {
                borders: dataTableBorders(),
                shading: { backgroundColor: c("FFFFFF"), foregroundColor: "empty", textureStyle: "TextureNone" },
                cellSpacing: 0,
                leftIndent: 0,
                tableAlignment: "Left",
                topMargin: 3.2, rightMargin: 7, leftMargin: 7, bottomMargin: 3.2,
                preferredWidth: 100,
                preferredWidthType: "Percent",
                bidi: false,
                allowAutoFit: true
            },
            description: null,
            title: null
        };
    }

    /* Charts (SFDT chart inline structure */
    function chartInline(title, chartType, categories, seriesList, opts) {
        opts = opts || {};
        var i, s, p;

        var chartCategory = [];
        for (i = 0; i < categories.length; i++) {
            var chartData = [];
            for (s = 0; s < seriesList.length; s++) {
                chartData.push({ yValue: seriesList[s].values[i] });
            }
            chartCategory.push({ chartData: chartData, categoryXName: categories[i] });
        }

        /* Line charts must carry exactly ONE dataPoint per series;
         * Doughnut/Pie need firstSliceAngle + holeSize on series[0]. */
        var isLine = /^Line/.test(chartType);
        var isPieFamily = chartType === "Pie" || chartType === "Doughnut";
        var chartSeries = [];
        for (s = 0; s < seriesList.length; s++) {
            var fill = seriesList[s].fill;
            var pts = [];
            var pointCount = isLine ? 1 : categories.length;
            for (p = 0; p < pointCount; p++) {
                var hex = Object.prototype.toString.call(fill) === "[object Array]"
                    ? fill[p % fill.length] : fill;
                pts.push({
                    fill: { foreColor: hex, rgb: "#" + hex },
                    line: { color: hex, rgb: "#" + hex }
                });
            }
            var series = { dataPoints: pts, seriesName: seriesList[s].name };
            if (isPieFamily && s === 0) {
                series.firstSliceAngle = 0;
                series.holeSize = chartType === "Doughnut" ? 50 : 0;
            }
            chartSeries.push(series);
        }

        var axisArea = function () {
            return { chartTitle: null, chartTitleArea: { layout: {}, dataFormat: { fill: {}, line: {} } } };
        };

        return {
            characterFormat: cf({}),
            chartLegend: {
                position: opts.legendPos || "Bottom",
                chartTitleArea: {
                    fontName: FONT, fontSize: 9,
                    layout: { layoutX: 0, layoutY: 0 },
                    dataFormat: {
                        fill: { foreColor: "000000", rgb: "#000000" },
                        line: { color: "808080", rgb: "#808080" }
                    }
                }
            },
            chartTitleArea: {
                fontName: FONT, fontSize: 12,
                layout: { layoutX: 0, layoutY: 0 },
                dataFormat: {
                    fill: { foreColor: "000000", rgb: "#000000" },
                    line: { color: "000000", rgb: "#000000" }
                }
            },
            chartArea: { foreColor: c("FFFFFF") },
            plotArea: { foreColor: c("111111") },
            chartCategory: chartCategory,
            chartSeries: chartSeries,
            chartPrimaryCategoryAxis: (function () {
                var a = axisArea();
                a.categoryType = "Automatic";
                a.fontSize = 9.5; a.fontName = FONT; a.numberFormat = "General";
                a.maximumValue = 0; a.minimumValue = 0; a.majorUnit = 0;
                a.hasMajorGridLines = false; a.hasMinorGridLines = false;
                a.majorTickMark = "TickMark_None"; a.minorTickMark = "TickMark_None";
                a.tickLabelPosition = "TickLabelPosition_NextToAxis";
                return a;
            })(),
            chartPrimaryValueAxis: (function () {
                var a = axisArea();
                a.fontSize = 9.5; a.fontName = FONT; a.numberFormat = "General";
                a.maximumValue = 0; a.minimumValue = 0; a.majorUnit = 0;
                a.hasMajorGridLines = opts.valueGrid !== false;
                a.hasMinorGridLines = false;
                a.majorTickMark = "TickMark_Outside"; a.minorTickMark = "TickMark_None";
                a.tickLabelPosition = "TickLabelPosition_NextToAxis";
                return a;
            })(),
            chartTitle: title,
            chartType: chartType,
            gapWidth: opts.gapWidth === undefined ? 0 : opts.gapWidth,
            overlap: 0,
            height: opts.height === undefined ? 250 : opts.height,
            width: opts.width === undefined ? 462 : opts.width
        };
    }

    function chartParagraph(chartInlineObj) {
        return {
            paragraphFormat: pf({ textAlignment: "Center", beforeSpacing: 6, afterSpacing: 0, lineSpacing: 1 }),
            characterFormat: cf({}),
            inlines: [chartInlineObj]
        };
    }

    /* Horizontal banner for the cover page */
    function bannerBlock(text) {
        return {
            rows: [row([cell([para([run(text, {
                bold: true, fontSize: 12, fontColor: c(T.white)
            })], { textAlignment: "Center", afterSpacing: 0 })], 100, T.primary, 0, {
                valign: "Center", bold: true
            })], { height: 34 })],
            grid: [CONTENT_W],
            tableFormat: {
                borders: NO_BORDERS,
                shading: { backgroundColor: c("FFFFFF"), foregroundColor: "empty", textureStyle: "TextureNone" },
                cellSpacing: 0,
                leftIndent: 0,
                tableAlignment: "Left",
                topMargin: 8, rightMargin: 8, leftMargin: 8, bottomMargin: 8,
                preferredWidth: 100,
                preferredWidthType: "Percent",
                bidi: false,
                allowAutoFit: true
            },
            description: null,
            title: null
        };
    }

    /* Style definitions */
    function stylesBlock() {
        var cfH = function (size, color) {
            return { bold: true, fontSize: size, fontFamily: FONT, fontColor: c(color) };
        };
        var pfH = function (outline) {
            return { beforeSpacing: 14, afterSpacing: 6, lineSpacing: 1.15, lineSpacingType: "Multiple", outlineLevel: outline, listFormat: {} };
        };
        return [
            { name: "Normal", type: "Paragraph", paragraphFormat: { listFormat: {} }, characterFormat: cf({}), next: "Normal" },
            { name: "Heading 1", type: "Paragraph", basedOn: "Normal", next: "Normal", link: "Heading 1 Char", characterFormat: cfH(16.5, T.primary), paragraphFormat: pfH("Level1") },
            { name: "Heading 1 Char", type: "Character", basedOn: "Default Paragraph Font", characterFormat: cfH(16.5, T.primary) },
            { name: "Heading 2", type: "Paragraph", basedOn: "Normal", next: "Normal", link: "Heading 2 Char", characterFormat: cfH(13, T.secondary), paragraphFormat: pfH("Level2") },
            { name: "Heading 2 Char", type: "Character", basedOn: "Default Paragraph Font", characterFormat: cfH(13, T.secondary) },
            { name: "Heading 3", type: "Paragraph", basedOn: "Normal", next: "Normal", link: "Heading 3 Char", characterFormat: cfH(11.5, T.primary), paragraphFormat: pfH("Level3") },
            { name: "Heading 3 Char", type: "Character", basedOn: "Default Paragraph Font", characterFormat: cfH(11.5, T.primary) },
            { name: "Default Paragraph Font", type: "Character", characterFormat: cf({}) }
        ];
    }

    function sectionFormat() {
        return {
            pageWidth: PAGE_W, pageHeight: PAGE_H,
            leftMargin: MARGIN, rightMargin: MARGIN,
            topMargin: 66, bottomMargin: 66,
            headerDistance: 34, footerDistance: 34,
            differentFirstPage: false, differentOddAndEvenPages: false,
            bidi: false
        };
    }

    /* History with current-year overrides from the UI */
    function historyWithOverrides(metrics) {
        var h = {
            years: data.historical.years.slice(0),
            scope1: data.historical.scope1.slice(0),
            scope2: data.historical.scope2.slice(0),
            energy: data.historical.energy.slice(0),
            renew: data.historical.renew.slice(0),
            training: data.historical.training.slice(0),
            ltifr: data.historical.ltifr.slice(0)
        };
        var last = h.years.length - 1;
        if (metrics.scope1 != null) { h.scope1[last] = metrics.scope1; }
        if (metrics.scope2 != null) { h.scope2[last] = metrics.scope2; }
        if (metrics.energy != null) { h.energy[last] = metrics.energy; }
        if (metrics.renew != null) { h.renew[last] = metrics.renew; }
        if (metrics.training != null) { h.training[last] = metrics.training; }
        if (metrics.ltifr != null) { h.ltifr[last] = metrics.ltifr; }
        return h;
    }

    /* Cover page */
    function coverBlocks(cfg) {
        return [
            spacer(70),
            para([run(cfg.company.toUpperCase(), { bold: true, fontSize: 26, fontColor: c(T.primary) })],
                { textAlignment: "Center", afterSpacing: 6 }),
            para([run("Sustainability & ESG Report", { fontSize: 17, fontColor: c(T.slate) })],
                { textAlignment: "Center", afterSpacing: 26 }),
            bannerBlock(cfg.period + "   \u2022   " + cfg.framework + " disclosure   \u2022   " + cfg.region),
            spacer(30),
            para([run(
                "This report presents our environmental, social and governance performance for " +
                cfg.period + ". It has been generated programmatically from the reporting " +
                "organization's ESG data platform and remains fully editable in this document editor.",
                { fontSize: 11, fontColor: c("374151") })],
                { textAlignment: "Justify", afterSpacing: 20 }),
            para([run("Report generated on " + nowStamp(), { fontSize: 10, fontColor: c(T.slate) })],
                { textAlignment: "Center", afterSpacing: 40 }),
            para([run("All figures in this proof of concept are illustrative.", {
                italic: true, fontSize: 9, fontColor: c(T.slate)
            })], { textAlignment: "Center" }),
            para([run("Prepared with the Syncfusion\u00ae JavaScript DOCX Editor (Document Editor)", {
                italic: true, fontSize: 9, fontColor: c(T.slate)
            })], { textAlignment: "Center", afterSpacing: 0 })
        ];
    }

    /* Contents (TOC placeholder replaced programmatically after open) */
    function contentsBlocks() {
        return [
            para([run("Contents", { bold: true, fontSize: 14.5, fontColor: c(T.primary) })],
                { styleName: "Normal", afterSpacing: 10, lineSpacing: 1.1 }),
            {
                paragraphFormat: pf({ afterSpacing: 12 }),
                characterFormat: cf({}),
                inlines: [
                    bkmkStart("TOC_PLACEHOLDER"),
                    run(" ", {}),
                    bkmkEnd("TOC_PLACEHOLDER")
                ]
            }
        ];
    }

    /* Section 1 - Executive summary */
    function executiveBlocks(cfg, h, m) {
        var blocks = [];
        var totalCur = h.scope1[h.scope1.length - 1] + h.scope2[h.scope2.length - 1];
        var totalPrev = h.scope1[h.scope1.length - 2] + h.scope2[h.scope2.length - 2];
        var totalChg = pctChange(totalPrev, totalCur);

        blocks.push(heading(1, "1. Executive summary"));
        blocks.push(body([
            run(cfg.company + " publishes this " + cfg.framework + " sustainability report covering "),
            run(cfg.period, { bold: true }),
            run(" for " + cfg.region.toLowerCase() + " operations. Combined Scope 1 and Scope 2 emissions totalled "),
            run(thousands(totalCur) + " tCO\u2082e", { bold: true, fontColor: c(T.secondary) }),
            run(" (" + signed1(totalChg) + " year on year), while renewable electricity reached "),
            run(dec1(h.renew[h.renew.length - 1]) + "%", { bold: true, fontColor: c(T.secondary) }),
            run(" of total consumption.")
        ]));

        var rows = [];
        var mk = function (label, unit, prevVal, curVal, isPct, lowerBetter) {
            var chg = pctChange(prevVal, curVal);
            var good = lowerBetter ? chg < 0 : chg > 0;
            rows.push({
                cells: [
                    label, unit,
                    isPct ? dec1(prevVal) : thousands(prevVal),
                    isPct ? dec1(curVal) : thousands(curVal),
                    signed1(chg)
                ],
                zebra: rows.length % 2 === 0,
                deltaColor: good ? c(T.secondary) : c(T.red)
            });
        };
        mk("Scope 1 GHG emissions", "tCO\u2082e", h.scope1[h.scope1.length - 2], h.scope1[h.scope1.length - 1], false, true);
        mk("Scope 2 GHG emissions", "tCO\u2082e", h.scope2[h.scope2.length - 2], h.scope2[h.scope2.length - 1], false, true);
        mk("Energy consumption", "MWh", h.energy[h.energy.length - 2], h.energy[h.energy.length - 1], false, true);
        mk("Renewable electricity", "%", h.renew[h.renew.length - 2], h.renew[h.renew.length - 1], true, false);
        mk("Training hours per FTE", "hours", h.training[h.training.length - 2], h.training[h.training.length - 1], false, false);
        mk("Lost-time injury rate", "per 1M h", h.ltifr[h.ltifr.length - 2], h.ltifr[h.ltifr.length - 1], false, true);

        var kpiTable = tableBlock(
            ["Indicator", "Unit", "FY2024", cfg.period, "Change"],
            rows,
            [34, 14, 18, 18, 16]
        );
        /* colour the delta column cells */
        for (var k = 0; k < rows.length; k++) {
            if (rows[k].deltaColor) {
                var cellObj = kpiTable.rows[k + 1].cells[4];
                cellObj.blocks[0].inlines[0].characterFormat.fontColor = rows[k].deltaColor;
                cellObj.blocks[0].inlines[0].characterFormat.bold = true;
            }
        }

        blocks.push(kpiTable);
        blocks.push(caption("Table 1: Key performance indicators, " + cfg.period + " versus prior year."));
        blocks.push(body(
            "Emissions intensity for the reporting period stands at " +
            dec1(totalCur / Math.max(m.employees || 1, 1)) +
            " tCO\u2082e per employee. Detailed analyses, charts and site-level data can be found in the " +
            "sections that follow; all content is editable and can be re-exported to Microsoft Word."
        ));
        return blocks;
    }

    /* Section 2 - Environmental */
    function environmentalBlocks(cfg, h) {
        var blocks = [];
        var last = h.years.length - 1;

        blocks.push(heading(1, "2. Environmental performance"));
        blocks.push(body(
            "Our climate strategy prioritizes absolute emission reduction, electrification of " +
            "processes and the progressive switch to certified renewable electricity. The chart " +
            "below shows the five-year trajectory of our reported greenhouse gas emissions."
        ));

        blocks.push(heading(2, "2.1 Greenhouse gas emissions"));
        blocks.push(chartParagraph(chartInline(
            "Greenhouse gas emissions trend (tCO\u2082e)",
            "Line_Markers",
            h.years,
            [
                { name: "Scope 1", values: h.scope1, fill: T.primary },
                { name: "Scope 2", values: h.scope2, fill: T.accent }
            ],
            { legendPos: "Bottom", width: 462, height: 250, valueGrid: true }
        )));
        blocks.push(caption("Figure 1: Scope 1 and Scope 2 emissions, " + h.years[0] + " \u2013 " + h.years[last] + "."));
        blocks.push(body([
            run("Scope 1 emissions decreased by "),
            run(dec1(Math.abs(pctChange(h.scope1[last - 1], h.scope1[last]))) + "%", { bold: true }),
            run(" to " + thousands(h.scope1[last]) + " tCO\u2082e versus the prior year, driven by boiler electrification at two production sites. Scope 2 reduced by "),
            run(dec1(Math.abs(pctChange(h.scope2[last - 1], h.scope2[last]))) + "%", { bold: true }),
            run(" to " + thousands(h.scope2[last]) + " tCO\u2082e following additional renewable power purchase agreements.")
        ]));

        blocks.push(heading(2, "2.2 Energy and renewable electricity"));
        blocks.push(body(
            "Total energy consumption was " + thousands(h.energy[last]) + " MWh. The renewable electricity " +
            "share reached " + dec1(h.renew[last]) + "%, tracking our internal carbon-price roadmap towards " +
            "100% renewables by FY2030."
        ));
        blocks.push(chartParagraph(chartInline(
            "Renewable electricity share (%)",
            "Line_Markers",
            h.years,
            [{ name: "Renewable share", values: h.renew, fill: T.secondary }],
            { legendPos: "Bottom", width: 430, height: 230, valueGrid: true }
        )));
        blocks.push(caption("Figure 2: Renewable electricity as a share of total consumption."));
        return blocks;
    }

    /* Section 3 - Social */
    function socialBlocks(cfg, h, m) {
        var blocks = [];
        var last = h.years.length - 1;

        blocks.push(heading(1, "3. Social performance"));
        blocks.push(heading(2, "3.1 Workforce and culture"));
        blocks.push(body(
            "We employ " + thousands(m.employees) + " colleagues across the reporting boundary. " +
            "The gender diversity ratio stands at " + dec1(m.diversity) + "% and women hold " +
            dec1(m.women) + "% of leadership positions. Average training investment remains a core " +
            "enablement metric."
        ));

        var rows = [
            { cells: ["Employees (headcount)", thousands(m.employees), "\u2013"], zebra: false },
            { cells: ["Gender diversity (%)", dec1(m.diversity), "\u2013"], zebra: true },
            {
                cells: ["Training hours per FTE", dec1(h.training[last]), signed1(pctChange(h.training[last - 1], h.training[last]))],
                zebra: false
            },
            {
                cells: ["Lost-time injury rate (LTIFR)", dec1(h.ltifr[last]), signed1(pctChange(h.ltifr[last - 1], h.ltifr[last]))],
                zebra: true
            }
        ];
        blocks.push(tableBlock(["Indicator", cfg.period, "YoY"], rows, [46, 27, 27]));
        blocks.push(caption("Table 2: Social indicators at a glance."));

        blocks.push(heading(2, "3.2 Health, safety and wellbeing"));
        blocks.push(body(
            "The lost-time injury frequency rate improved to " + dec1(h.ltifr[last]) +
            " per one million hours worked, a cumulative reduction of more than 40% since " +
            h.years[0] + ". Site-level safety observation programs continue to drive early " +
            "intervention and reporting culture."
        ));
        blocks.push(chartParagraph(chartInline(
            "Lost-time injury frequency rate (per 1M hours)",
            "Column_Clustered",
            h.years,
            [{ name: "LTIFR", values: h.ltifr, fill: T.amber }],
            { legendPos: "Bottom", width: 430, height: 230, gapWidth: 60, valueGrid: true }
        )));
        blocks.push(caption("Figure 3: LTIFR trend, " + h.years[0] + " \u2013 " + h.years[last] + "."));
        return blocks;
    }

    /* Section 4 - Governance */
    function governanceBlocks(cfg, m) {
        var blocks = [];
        blocks.push(heading(1, "4. Governance"));
        blocks.push(heading(2, "4.1 Board composition and oversight"));
        blocks.push(body(
            "Independent directors represent " + dec1(m.board) + "% of the board. Sustainability " +
            "oversight is anchored at board level through the ESG committee, which reviews climate " +
            "risk, workforce and ethics metrics quarterly."
        ));
        blocks.push(chartParagraph(chartInline(
            "Board independence",
            "Doughnut",
            ["Independent", "Non-independent"],
            [{
                name: "Board composition",
                values: [m.board, Math.max(100 - m.board, 0)],
                fill: [T.secondary, T.accent2]
            }],
            { legendPos: "Right", width: 381, height: 240 }
        )));
        blocks.push(caption("Figure 4: Board composition, " + cfg.period + "."));

        blocks.push(heading(2, "4.2 Business conduct and supplier engagement"));
        blocks.push(body("Governance highlights for the period:", { afterSpacing: 4 }));
        blocks.push(bullet(thousands(m.suppliers) + " suppliers assessed against our Supplier Code of Conduct."));
        blocks.push(bullet("ESG-linked remuneration covers " + dec1(Math.min(90, m.board + 12)) + "% of executive variable pay schemes."));
        blocks.push(bullet("Anti-corruption training completion across all people-manager roles: 100%."));
        blocks.push(bullet("Whistle-blowing channel available in 9 languages with quarterly board reporting."));
        blocks.push(spacer(6));
        return blocks;
    }

    /* Section 5 - Regional sites */
    function siteBlocks(cfg) {
        var blocks = [];
        blocks.push(heading(1, "5. Regional site data"));
        var sites = data.filterSitesByRegion(cfg.region);

        if (!sites.length) {
            blocks.push(body("No sites reported for the selected scope (" + cfg.region + "). " +
                "Adjust the scope selector and regenerate the report."));
            return blocks;
        }

        var rows = [];
        var t1 = 0, t2 = 0, i;
        for (i = 0; i < sites.length; i++) {
            t1 += sites[i].scope1;
            t2 += sites[i].scope2;
            rows.push({
                cells: [
                    sites[i].name, sites[i].region,
                    thousands(sites[i].scope1), thousands(sites[i].scope2),
                    dec1(sites[i].renew) + "%"
                ],
                zebra: i % 2 === 0
            });
        }
        rows.push({
            cells: ["Total (" + sites.length + " sites)", "", thousands(t1), thousands(t2), ""],
            bold: true, isTotal: true
        });

        blocks.push(tableBlock(
            ["Site", "Region", "Scope 1 (tCO\u2082e)", "Scope 2 (tCO\u2082e)", "Renewable"],
            rows,
            [28, 18, 19, 19, 16]
        ));
        blocks.push(caption("Table 3: Site-level emissions and renewable electricity share (" + cfg.region + ")."));
        return blocks;
    }

    /* Section 6 - Data appendix */
    function appendixBlocks(cfg, m) {
        var blocks = [];
        blocks.push(heading(1, "6. Data appendix"));
        blocks.push(body(
            "The consolidated indicator set below feeds every table and chart in this report. In a " +
            "production deployment these values are retrieved from the ESG data warehouse at " +
            "generation time, guaranteeing a single source of truth for published disclosures."
        ));

        function r(label, unit, value, zebra) {
            return { cells: [label, unit, value], zebra: !!zebra };
        }
        var rows = [
            r("Scope 1 GHG emissions", "tCO\u2082e", thousands(m.scope1), false),
            r("Scope 2 GHG emissions", "tCO\u2082e", thousands(m.scope2), true),
            r("Total GHG (Scope 1 + 2)", "tCO\u2082e", thousands(m.scope1 + m.scope2), false),
            r("Energy consumption", "MWh", thousands(m.energy), true),
            r("Renewable electricity share", "%", dec1(m.renew), false),
            r("Employees", "headcount", thousands(m.employees), true),
            r("Gender diversity ratio", "%", dec1(m.diversity), false),
            r("Training hours per FTE", "hours", dec1(m.training), true),
            r("LTIFR", "per 1M hours", dec1(m.ltifr), false),
            r("Board independence", "%", dec1(m.board), true),
            r("Women in leadership", "%", dec1(m.women), false),
            r("Suppliers assessed", "count", thousands(m.suppliers), true)
        ];
        blocks.push(tableBlock(["Indicator", "Unit", cfg.period], rows, [48, 22, 30]));
        blocks.push(caption("Table 4: Consolidated ESG indicators for " + cfg.period + "."));

        blocks.push(heading(2, "6.1 Methodology and definitions"));
        blocks.push(bullet("Scope 1 covers direct emissions from owned or controlled sources."));
        blocks.push(bullet("Scope 2 covers indirect emissions from purchased electricity (market-based)."));
        blocks.push(bullet("LTIFR is defined as lost-time injuries x 1,000,000 / hours worked."));
        blocks.push(bullet("Workforce metrics are reported as at the last day of the financial year."));
        blocks.push(spacer(4));
        blocks.push(heading(2, "6.2 Disclaimer"));
        blocks.push(body(
            "This document is a technology proof of concept. All numbers are illustrative and do not " +
            "represent a real organization. The generated document demonstrates how an ESG disclosure " +
            "can be assembled from structured data and then reviewed, commented and signed off inside " +
            "a web-based word processor.",
            { afterSpacing: 0 }
        ));
        return blocks;
    }

    /* Assemble document */
    function build(cfg) {
        cfg = cfg || {};
        var m = {
            scope1: Number(cfg.metrics.scope1),
            scope2: Number(cfg.metrics.scope2),
            energy: Number(cfg.metrics.energy),
            renew: Number(cfg.metrics.renew),
            employees: Number(cfg.metrics.employees),
            diversity: Number(cfg.metrics.diversity),
            training: Number(cfg.metrics.training),
            ltifr: Number(cfg.metrics.ltifr),
            board: Number(cfg.metrics.board),
            women: Number(cfg.metrics.women),
            suppliers: Number(cfg.metrics.suppliers)
        };
        var h = historyWithOverrides(m);
        var include = cfg.include || { env: true, soc: true, gov: true, data: true };

        var bodyBlocks = [];
        bodyBlocks = bodyBlocks.concat(contentsBlocks());
        bodyBlocks = bodyBlocks.concat(executiveBlocks(cfg, h, m));
        if (include.env) { bodyBlocks = bodyBlocks.concat(environmentalBlocks(cfg, h)); }
        if (include.soc) { bodyBlocks = bodyBlocks.concat(socialBlocks(cfg, h, m)); }
        if (include.gov) { bodyBlocks = bodyBlocks.concat(governanceBlocks(cfg, m)); }
        bodyBlocks = bodyBlocks.concat(siteBlocks(cfg));
        if (include.data) { bodyBlocks = bodyBlocks.concat(appendixBlocks(cfg, m)); }

        var headersFooters = {
            defaultHeader: { blocks: [para([run(
                cfg.company + "  \u2014  ESG Sustainability Report  \u2014  " + cfg.period,
                { fontSize: 8.5, fontColor: c(T.slate) }
            )], { textAlignment: "Center", afterSpacing: 0 })] },
            defaultFooter: { blocks: [para([run(
                "Confidential \u2022 " + cfg.framework + " disclosure " + cfg.period + " \u2022 Generated " + nowStamp(),
                { fontSize: 8.5, fontColor: c(T.slate) }
            )], { textAlignment: "Center", afterSpacing: 0 })] }
        };

        var doc = {
            sections: [
                { blocks: coverBlocks(cfg), headersFooters: {}, sectionFormat: sectionFormat() },
                { blocks: bodyBlocks, headersFooters: headersFooters, sectionFormat: sectionFormat() }
            ],
            characterFormat: cf({ fontSize: BODY_SIZE, fontColor: c("1F2937") }),
            paragraphFormat: {
                leftIndent: 0, rightIndent: 0, firstLineIndent: 0,
                textAlignment: "Left", beforeSpacing: 0, afterSpacing: 8,
                lineSpacing: 1.15, lineSpacingType: "Multiple",
                listFormat: {}, bidi: false
            },
            background: { color: c("FFFFFF") },
            defaultTabWidth: 36,
            enforcement: false,
            hashValue: "",
            saltValue: "",
            formatting: false,
            protectionType: "NoProtection",
            styles: stylesBlock(),
            lists: [],
            abstractLists: []
        };

        return JSON.stringify(doc);
    }

    return { build: build };
})(typeof EsgData !== "undefined" ? EsgData : null);

/* ========================================================================== */
/* 3. App bootstrap - DocumentEditorContainer with Ribbon toolbar             */
/* ========================================================================== */
var container;
var editor;

document.addEventListener("DOMContentLoaded", function () {
    ej.base.enableRipple(true);

    container = new ej.documenteditor.DocumentEditorContainer({
        enableToolbar: true,
        toolbarMode: "Ribbon",           /* <- Ribbon mode instead of classic toolbar */
        height: "100%",
        showStatusBar: true
    });
    container.appendTo("#DocumentEditor");
    // Use the following service URL only for demo purposes
container.serviceUrl = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    editor = container.documentEditor;

    buildReport(true);
    wireUpUi();
    setStatus("Report generated. The document above is fully editable like Microsoft Word.");
});

/* Helpers */
function setStatus(msg, isError) {
    var el = document.getElementById("statusMessage");
    el.classList.toggle("error", !!isError);
    el.innerHTML = msg;
}

function readMetrics() {
    return {
        scope1: document.getElementById("mScope1").value,
        scope2: document.getElementById("mScope2").value,
        energy: document.getElementById("mEnergy").value,
        renew: document.getElementById("mRenew").value,
        employees: document.getElementById("mEmployees").value,
        diversity: document.getElementById("mDiversity").value,
        training: document.getElementById("mTraining").value,
        ltifr: document.getElementById("mLtifr").value,
        board: document.getElementById("mBoard").value,
        women: document.getElementById("mWomen").value,
        suppliers: document.getElementById("mSuppliers").value
    };
}

function readConfig() {
    return {
        company: document.getElementById("txtCompany").value || "Your Company",
        period: document.getElementById("txtPeriod").value || "FY 2025",
        region: document.getElementById("cboRegion").value,
        framework: document.getElementById("cboStandard").value,
        metrics: readMetrics(),
        include: {
            env: document.getElementById("chkEnv").checked,
            soc: document.getElementById("chkSoc").checked,
            gov: document.getElementById("chkGov").checked,
            data: document.getElementById("chkData").checked
        }
    };
}

/* Insert a table of contents at the placeholder bookmark position */
function insertToc() {
    try {
        editor.selection.selectBookmark("TOC_PLACEHOLDER", true);
        editor.editor.insertTableOfContents({
            startLevel: 1,
            endLevel: 2,
            includeHyperlink: true,
            includePageNumber: true,
            rightAlign: true
        });
    } catch (e) {
        console.warn("TOC insertion skipped:", e);
    }
}

/* Generate the ESG report */
function buildReport(initial) {
    var cfg = readConfig();

    if (!cfg.include.env && !cfg.include.soc && !cfg.include.gov && !cfg.include.data) {
        setStatus("Please select at least one report section (Environmental, Social, Governance or Data appendix).", true);
        return;
    }

    var sfdt = EsgReportBuilder.build(cfg);
    editor.open(sfdt);
    editor.documentName = makeFileName(cfg);

    setTimeout(function () { insertToc(); }, 250);

    setStatus(
        "ESG report for <b>" + escapeHtml(cfg.company) + "</b> generated (" +
        (cfg.include.env ? "E" : "") + (cfg.include.soc ? "S" : "") +
        (cfg.include.gov ? "G" : "") + (cfg.include.data ? " + data" : "") +
        "). Edit freely, then save as .docx."
    );
}

function makeFileName(cfg) {
    var company = (cfg.company || "esg-report").replace(/[^A-Za-z0-9]+/g, "-");
    return company + "-ESG-Report-" + String(cfg.period || "").replace(/[^A-Za-z0-9]+/g, "-");
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
}

/* Chrome buttons */
function wireUpUi() {
    document.getElementById("btnBuild").addEventListener("click", function () { buildReport(false); });

    document.getElementById("btnReset").addEventListener("click", function () {
        buildReport(false);
        setStatus("Report reset to the generated template.");
    });

    document.getElementById("btnExportDocx").addEventListener("click", function () {
        editor.save(editor.documentName || "ESG-Report", "Docx");
    });

    document.getElementById("btnExportSfdt").addEventListener("click", function () {
        editor.save(editor.documentName || "ESG-Report", "Sfdt");
    });

    document.getElementById("btnPrint").addEventListener("click", function () {
        editor.print();
    });

    document.getElementById("btnOpen").addEventListener("click", function () {
        document.getElementById("fileUpload").click();
    });

    document.getElementById("fileUpload").addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) { return; }
        if (file.name.substr(file.name.lastIndexOf(".")) !== ".sfdt") {
            setStatus("Only .sfdt drafts saved by this sample are supported (keeps the POC 100% client-side).", true);
            e.target.value = "";
            return;
        }
        var reader = new FileReader();
        reader.onload = function (ev) {
            editor.open(ev.target.result);
            editor.documentName = file.name.substr(0, file.name.lastIndexOf("."));
            setStatus('Opened draft "' + escapeHtml(file.name) + '".');
        };
        reader.readAsText(file);
        e.target.value = "";
    });

    document.getElementById("chkAll").addEventListener("change", function (e) {
        var checked = e.target.checked;
        ["chkEnv", "chkSoc", "chkGov", "chkData"].forEach(function (id) {
            document.getElementById(id).checked = checked;
        });
    });
}
