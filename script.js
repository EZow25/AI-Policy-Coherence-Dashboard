document.querySelectorAll(".info-box-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
        toggle.closest(".info-box").classList.toggle("open");
    });
});

// https://d3-graph-gallery.com/graph/backgroundmap_basic.html

const map_m = { top: 20, right: 20, bottom: 20, left: 20 };

const map_outerWidth = document.getElementById("map-container").clientWidth;
const map_outerHeight = document.getElementById("map-container").clientHeight;

const map_width = map_outerWidth - map_m.left - map_m.right;
const map_height = map_outerHeight - map_m.top - map_m.bottom;

const color = d3.scaleSequential()
        .domain([0, 100])
        .interpolator(d3.interpolateBlues);

// https://stackoverflow.com/questions/49739119/legend-with-smooth-gradient-and-corresponding-labels
const legend_svg = d3.select("#map-container").append("svg")
    .attr("width", 500)
    .attr("height", 80);

const defs = legend_svg.append("defs");

const gradient = defs.append('linearGradient')
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

gradient.selectAll("stop")
    .data([
        {offset: "0%", color: "#F7FBFF"},
        {offset: "100%", color: "#08306B"}
    ])
    .enter()
    .append("stop")
    .attr("offset", function(d) {
        return d.offset
    })
    .attr("stop-color", function(d) {
        return d.color
    });

legend_svg.append("rect")
    .attr("x", 20)
    .attr("y", 20)
    .attr("width", 300)
    .attr("height", 15)
    .attr("transform", "translate(60, 0)")
    .style("fill", "url(#gradient)");

const x_leg = d3.scaleLinear()
    .domain([0, 100])
    .range([40, 340]);

const tick_labels = ["0%", "100%"];
const axis_leg = d3.axisBottom(x_leg)
    .tickValues(color.domain())
    .tickFormat((d, i) => tick_labels[i]); // https://ghenshaw-work.medium.com/customizing-axes-in-d3-js-99d58863738b

legend_svg.attr("class", "axis")
    .append("g")
    .attr("transform", "translate(40, 35)")
    .call(axis_leg);

legend_svg.append("text")
    .text("Coherence")
    .style("font-size", "12pt")
    .style("font-weight", 600)  
    .attr("x", 50)
    .attr("y", 15);

const map_svg = d3.select("#map-container")
    .append("svg")
    .attr("viewBox", `0 0 ${map_outerWidth} ${map_outerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

const projection = d3.geoNaturalEarth1()
    
const matrix_m = { top: 20, right: 0, bottom: 15, left: 100 };
const matrix_outerWidth = document.getElementById("matrix-container").clientWidth;
const matrix_outerHeight = document.getElementById("matrix-container").clientHeight;

const matrix_width = matrix_outerWidth - matrix_m.left - matrix_m.right;
const matrix_height = matrix_outerHeight - matrix_m.top - matrix_m.bottom;

const matrix_svg = d3.select("#matrix-container")
    .append("svg")
    .attr("width", "100%") 
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${matrix_outerWidth} ${matrix_outerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

const se_asia = ["Myanmar", "Thailand", "Laos", "Vietnam", "Cambodia", "Malaysia", "Brunei", "Singapore", "Philippines", "Indonesia", "Timor-Leste"];
const principles_labels = {"p1": "Transparency & Explainability", "p2": "Fairness & Equity", "p3": "Security & Safety", "p4": "Human-centricity", "p5": "Privacy & Data Governance", "p6": "Accountability & Integrity", "p7": "Robustness & Reliability"};

// Principle icons — defined here so both the matrix and PCP can use them
const principleIcons = {
    "Transparency & Explainability": "assets/transparency.svg",
    "Fairness & Equity":             "assets/fairness.svg",
    "Security & Safety":             "assets/security.svg",
    "Human-centricity":              "assets/human.svg",
    "Privacy & Data Governance":     "assets/privacy.svg",
    "Accountability & Integrity":    "assets/accountability.svg",
    "Robustness & Reliability":      "assets/robustness.svg"
};

function moveTooltip(event) {
    const pad = 12;
    const node = tooltip.node();
    const tw = node.offsetWidth;
    const th = node.offsetHeight;

    const x = (event.clientX + pad + tw > window.innerWidth)
        ? event.clientX - pad - tw   // flip left
        : event.clientX + pad;

    const y = (event.clientY + pad + th > window.innerHeight)
        ? event.clientY - pad - th   // flip above
        : event.clientY + pad;

    tooltip
        .style("left", x + "px")
        .style("top", y + "px");
}

function hideTooltip() {
    tooltip.classed("visible", false);
}

d3.csv("data/scores.csv").then(raw => {
    let scores = d3.group(raw, d => d.Principle);
    let filters = ["overall", "p1", "p2", "p3", "p4", "p5", "p6", "p7"];
    
    function update_scores(event) {
        const clicked = event.currentTarget;
        if (clicked.name === "overall") {
            d3.selectAll("input[type='checkbox']")
                .property("checked", clicked.checked);
        } else {
            if (!clicked.checked) {
                d3.select("input[name='overall']")
                    .property("checked", false);
            } 
        }
        let p_filters = Array.from(d3.selectAll("input[type='checkbox']")).filter(p => {
            return p.checked;
        }).map(p => p.name);
        if (p_filters.length >= 7) {
            d3.select("input[name='overall']")
                    .property("checked", true);
            p_filters.unshift("overall"); 
        }
        filters = p_filters
        scores = d3.group(raw.filter(d => filters.includes(d.Principle)), d => d.Principle);

        render();
    }
    let renderMatrix = () => {};
    let update_matrix = () => {};
    let renderPCP = () => {};
    let update_pcp = () => {};
    let update_map = () => {};

    let countryPaths;
    d3.json("data/countries.geojson").then(data => {
        
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [map_width, map_height]])
            .on('zoom', zoomed);

        map_svg.call(zoom);

        projection.fitExtent(
            [[map_m.left, map_m.top], [map_outerWidth - map_m.right, map_outerHeight - map_m.bottom]],
            { type: "FeatureCollection", features: data.features }
        );

        const map_g = map_svg.append("g")

        countryPaths = map_g
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
                .attr("d", d3.geoPath().projection(projection))
                .attr("class", "country")
                .attr("fill", color(0))
                .style("stroke", "#000000")
                .style("stroke-width", 1);

        countryPaths.on("mouseout", (event) => {
            d3.select(event.currentTarget)
                .transition().duration(200)
                .style("stroke-width", 1);
            hideTooltip();
            update_matrix(null);
            update_pcp(null);
        }).on("mousemove", (event) => {
            moveTooltip(event);
        }).on("click", (event, d) => {
            const name = d.properties.name;
            window.location.href = `country.html?name=${encodeURIComponent(name)}`;
        });

        render();
        
        function zoomed(event) {
            map_g
                .selectAll('path') // To prevent stroke width from scaling
                .attr('transform', event.transform);
        }
    });
    let countries_overall;
    function render() {
        if (!countryPaths) return;

        countries_overall = new Map(se_asia.map(country => {
            let val;
            if (filters.includes("overall") && filters.length === 8) {
                val = +scores.get("overall")[0][country];
            } else if (filters.length === 0) {
                val = 0;
            } else {
                const principleFilters = filters.filter(f => f !== "overall");
                val = d3.mean(principleFilters, f => +scores.get(f)[0][country]);
            }
            return [country, Math.round(val ?? 0)];
        }));

        // Smooth fill transition on update
        countryPaths
            .transition().duration(500).ease(d3.easeCubicInOut)
            .attr("fill", d => color(countries_overall.get(d.properties.name) ?? 0));
        renderMatrix();
        renderPCP();
    }

    d3.selectAll("input[type='checkbox']").on("click", update_scores);

    render();
    // https://github.com/codeforgermany/click_that_hood/blob/main/public/data/southeast-asia.geojson
    // https://github.com/johan/world.geo.json/blob/master/countries.geo.json to get Singapore
    d3.json("data/countries.geojson").then(data => {
        const p_nums = [1, 2, 3, 4, 5, 6, 7];
        const cleaned = raw.filter(d => p_nums.includes(+d.Principle.slice(1)));

        const points = cleaned.flatMap(d => se_asia.map(country => ({
            principle: principles_labels[d.Principle],
            principleKey: d.Principle,
            country,
            val: +d[country]
        })));

        const x = d3.scaleBand()
            .domain(Object.values(principles_labels))
            .range([matrix_m.left, matrix_outerWidth - matrix_m.right])
            .padding(0.1);

        const y = d3.scaleBand()
            .domain(se_asia)
            .range([matrix_m.top, matrix_outerHeight - matrix_m.bottom])
            .padding(0.1);

        const maxRadius = 15;
        const r = d3.scaleSqrt()
            .domain([0, 100])
            .range([2, maxRadius]);

        const textColor = d3.scaleThreshold()
            .domain([50])
            .range(["#08306B", "#ffffff"]);

        const iconSize = 16;

        // Icons & axes — built once, never change
        matrix_svg.selectAll(".x-icon")
            .data(Object.values(principles_labels))
            .enter()
            .append("image")
            .attr("class", "x-icon")
            .attr("href", d => principleIcons[d])
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("x", d => x(d) + x.bandwidth() / 2 - iconSize / 2)
            .attr("y", matrix_height + 20)
            .style("cursor", "pointer")
            .on("click", (event, d) => { 
                // 1. Reverse-lookup the key (e.g., "p1") from the label ("Transparency...")
                const key = Object.keys(principles_labels).find(k => principles_labels[k] === d);
                
                // 2. Find the actual HTML checkbox and click it
                const checkbox = document.querySelector(`input[name='${key}']`);
                if (checkbox) checkbox.click();
            })
            .append("title")
                .text(d => `${d} (Click to filter in/out)`);

        matrix_svg.append("g")
            .attr("id", "matrix-y")
            .attr("transform", `translate(${matrix_m.left}, 0)`)
            .call(d3.axisLeft(y).tickSize(0))
            .call(axis => axis.select(".domain").remove());

        matrix_svg.selectAll("#matrix-y text")
            .style("font-size", "12pt");

        const cell_width = (x.range()[1] - x.range()[0]) / Object.values(principles_labels).length;
        const cell_height = (y.range()[1] - y.range()[0]) / se_asia.length;

        const cell = matrix_svg.selectAll(".cell")
            .data(points)
            .enter()
            .append("g")
            .attr("class", "cell")
            .attr("width", cell_width)
            .attr("height", cell_height)
            .attr("transform", d =>
                `translate(${x(d.principle) + x.bandwidth() / 2}, ${y(d.country) + y.bandwidth() / 2})`
            );

        cell.append("circle")
            .attr("r", d => r(d.val))
            .attr("fill", d => color(d.val))
            .attr("stroke", "#000")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.85);

        cell.append("text")
            .text(d => d.val + "%")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "9pt")
            .style("font-weight", 600)
            .style("pointer-events", "none")
            .style("fill", d => textColor(d.val));
        
        cell.on("mouseover", (event, d) => {
            d3.select(event.currentTarget).select("circle")
                .attr("stroke-width", 3)
            
            tooltip
                .html(`<b>${d.country}</b><div>${d.principle}: ${d.val}%</div>`)
                .classed("visible", true);
            moveTooltip(event);
            update_map(d.country);
            update_pcp(d.country);
        }).on("mousemove", (event) => {
            moveTooltip(event);
        }).on("mouseout", (event) => {
            d3.select(event.currentTarget).select("circle")
                .attr("stroke-width", 0.5)
            
            hideTooltip();
            update_map(null);
            update_pcp(null);
        });

        let showLabels = true;
        d3.select("#toggle-labels").on("click", function() {
            showLabels = !showLabels;
            cell.selectAll("text")
                .transition().duration(300)
                .style("opacity", showLabels ? null : 0);
            d3.select(this).text(showLabels ? "Hide scores" : "Show scores");
        });

        renderMatrix = () => {
            const activePrinciples = new Set(filters.filter(f => f !== "overall"));

            cell.transition().duration(500).ease(d3.easeCubicInOut)
                .attr("opacity", d => activePrinciples.has(d.principleKey) ? 1 : 0.15);

            matrix_svg.selectAll(".x-icon")
                .transition().duration(500).ease(d3.easeCubicInOut)
                .attr("opacity", d => {
                    const key = Object.keys(principles_labels).find(k => principles_labels[k] === d);
                    return activePrinciples.has(key) ? 1 : 0.15;
                });
        };

        renderMatrix();

        // Update tooltip handler with latest data
        countryPaths.on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(200)
                .style("stroke-width", 3.5);
            showTooltip(event, d);
        });

        renderMatrix();

        function showTooltip(event, d) {
            let html = `<div>Coherence: ${countries_overall.get(d.properties.name)}%</div><hr>`;
            filters.forEach(f => {
                if (f === "overall") return;
                const rows = scores.get(f);
                if (!rows) return;
                html += `<div>${principles_labels[f]}: ${rows[0][d.properties.name]}%</div>`;
            });
            tooltip
                .html(`<b>${d.properties.name}</b>` + html)
                .classed("visible", true);
            moveTooltip(event);

            update_matrix(d.properties.name)
            update_pcp(d.properties.name)
        }

        update_matrix = (country) => {
            const activePrinciples = new Set(filters.filter(f => f !== "overall"));

            cell.selectAll("circle").transition().duration(100)
                .attr("stroke", d =>
                    d.country === country && activePrinciples.has(d.principleKey) ? "#1d1d1d" : "#000"
                )
                .attr("stroke-width", d => {
                    return d.country === country && activePrinciples.has(d.principleKey) ? 3 : 0.5;
                });

            matrix_svg.selectAll("#matrix-y .tick text")
                .style("font-weight", d => d === country ? 600 : 400);
        };
    });

    // ════════════════════════════════════════════════════════════════
    // PARALLEL COORDINATE PLOT
    // Each column = one principle (p1–p7); each line = one country.
    // Always reads from raw so it always has all 7 principle values.
    // renderPCP() dims inactive axis columns when filters change.
    // ════════════════════════════════════════════════════════════════

    const pcpContainer = document.getElementById("pcp-container");
    const pcp_m = { top: 44, right: 20, bottom: 48, left: 16 };
    const pcp_outerWidth  = pcpContainer.clientWidth  || 800;
    // Remaining height after the .pcp-header (~36 px) and bottom padding (~12 px).
    // Fall back to 240 if clientHeight hasn't been laid out yet (e.g. on back-navigation).
    const pcp_outerHeight = Math.max(240, pcpContainer.clientHeight - 80);

    const pcp_svg = d3.select("#pcp-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%") 
    .attr("viewBox", `0 0 ${pcp_outerWidth} ${pcp_outerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("overflow", "visible");

    const pcp_principles = Object.keys(principles_labels);

    // ── Scales ───────────────────────────────────────────────────────
    const pcp_x = d3.scalePoint()
        .domain(pcp_principles)
        .range([pcp_m.left, pcp_outerWidth - pcp_m.right])
        .padding(0.25);

    const pcp_y = d3.scaleLinear()
        .domain([0, 100])
        .range([pcp_outerHeight - pcp_m.bottom, pcp_m.top]);

    // 11 visually distinct colors — one per country
    const countryPalette = [
        "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
        "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac", "#17becf"
    ];
    const countryColors = d3.scaleOrdinal()
        .domain(se_asia)
        .range(countryPalette);

    // ── Draw one axis per principle ──────────────────────────────────
    const pcpAxisGroups = {};
    const pcp_iconSize = 22;

    pcp_principles.forEach(p => {
        const xPos = pcp_x(p);

        // Axis line + ticks
        const g = pcp_svg.append("g")
            .attr("class", `pcp-axis pcp-axis-${p}`)
            .attr("transform", `translate(${xPos}, 0)`)
            .call(
                d3.axisLeft(pcp_y)
                    .tickValues([0, 25, 50, 75, 100])
                    .tickSize(3)
                    .tickFormat(d => d + "%")
            );
        g.select(".domain").attr("stroke", "#aaa");
        g.selectAll("text").style("font-size", "7.5pt").attr("fill", "#555");
        g.selectAll(".tick line").attr("stroke", "#aaa");
        pcpAxisGroups[p] = g;

        // Principle icon above the axis
        pcp_svg.append("image")
            .attr("class", `pcp-axis-icon pcp-axis-icon-${p} x-icon`)
            .attr("href", principleIcons[principles_labels[p]])
            .attr("width",  pcp_iconSize)
            .attr("height", pcp_iconSize)
            .attr("x", xPos - pcp_iconSize / 2)
            .attr("y", 4)
            .style("cursor", "pointer")
            .on("click", () => {
                const checkbox = document.querySelector(`input[name='${p}']`);
                if (checkbox) checkbox.click();
            })
            .append("title").text(`${principles_labels[p]} (Click to filter in/out)`);
    });

    // ── Build country data from raw (always all 7 principles) ────────
    const allRawScores = d3.group(raw, d => d.Principle);

    const pcpData = se_asia.map(country => {
        const row = { country };
        pcp_principles.forEach(p => {
            const rows = allRawScores.get(p);
            row[p] = rows ? +rows[0][country] : 0;
        });
        return row;
    });

    // Line generator: maps each principle key to its [x, y] pixel position
    function makePCPLine(d) {
        return d3.line()(pcp_principles.map(p => [pcp_x(p), pcp_y(d[p])]));
    }

    // ── Draw country lines ───────────────────────────────────────────
    const pcpLinesGroup = pcp_svg.append("g").attr("class", "pcp-lines");

    const countryLineGroups = pcpLinesGroup
        .selectAll(".pcp-country")
        .data(pcpData, d => d.country)
        .enter()
        .append("g")
        .attr("class", "pcp-country")
        .style("cursor", "pointer");

    // Invisible wide path for easy mouse-target (no hit-test gaps on thin lines)
    countryLineGroups.append("path")
        .attr("class", "pcp-line-hover")
        .attr("d", makePCPLine)
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", 14);

    // Visible styled path
    countryLineGroups.append("path")
        .attr("class", "pcp-line-visible")
        .attr("d", makePCPLine)
        .attr("fill", "none")
        .attr("stroke", d => countryColors(d.country))
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("opacity", 0.72);

    // ── Interaction ──────────────────────────────────────────────────
    countryLineGroups
        .on("mouseover", function(event, d) {
            // Bring hovered country to front
            d3.select(this).raise();

            // Highlight this line
            d3.select(this).select(".pcp-line-visible")
                .attr("stroke-width", 4.5)
                .attr("opacity", 1);

            // Dim all other lines
            pcpLinesGroup.selectAll(".pcp-country")
                .filter(c => c.country !== d.country)
                .select(".pcp-line-visible")
                .transition().duration(100)
                .attr("opacity", 0.1);

            // Build tooltip: show all principle scores
            const allScoreRows = d3.group(raw, r => r.Principle);
            let html = "";
            pcp_principles.forEach(p => {
                const rows = allScoreRows.get(p);
                const val  = rows ? +rows[0][d.country] : 0;
                html += `<div>${principles_labels[p]}: ${val}%</div>`;
            });
            tooltip
                .html(`<b>${d.country}</b><hr>${html}`)
                .classed("visible", true);
            update_map(d.country);
            update_matrix(d.country);
            moveTooltip(event);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function() {
            // Restore all lines
            pcpLinesGroup.selectAll(".pcp-country .pcp-line-visible")
                .transition().duration(200)
                .attr("stroke-width", 2.5)
                .attr("opacity", 0.72);
            update_map(null);
            update_matrix(null);    
            hideTooltip();
        })
        .on("click", (event, d) => {
            window.location.href = `country.html?name=${encodeURIComponent(d.country)}`;
        });

    // ── renderPCP: respond to filter changes ─────────────────────────
    // Drops inactive principle columns entirely: x-scale is rebuilt from
    // only the active principles, axes/icons are repositioned or hidden,
    // and country lines are redrawn to span just the remaining columns.
    renderPCP = () => {
        const activeList = pcp_principles.filter(p =>
            filters.includes(p) || (filters.includes("overall") && filters.length === 8)
        );

        // If none active, just hide everything
        if (activeList.length === 0) {
            pcp_principles.forEach(p => {
                pcpAxisGroups[p].transition().duration(400)
                    .attr("opacity", 0)
                    .style("pointer-events", "none");
                pcp_svg.selectAll(`.pcp-axis-icon-${p}`)
                    .transition().duration(400)
                    .attr("opacity", 0)
                    .style("pointer-events", "none");
            });
            pcpLinesGroup.selectAll(".pcp-country path")
                .transition().duration(400)
                .attr("opacity", 0);
            return;
        }

        // Rebuild x-scale on the active principles only
        pcp_x.domain(activeList)
            .range([pcp_m.left, pcp_outerWidth - pcp_m.right])
            .padding(0.25);

        // Re-position / show active axes, hide inactive ones
        pcp_principles.forEach(p => {
            const active = activeList.includes(p);
            const xPos = active ? pcp_x(p) : 0;

            pcpAxisGroups[p]
                .transition().duration(500).ease(d3.easeCubicInOut)
                .attr("transform", `translate(${xPos}, 0)`)
                .attr("opacity", active ? 1 : 0)
                .style("pointer-events", active ? null : "none");

            pcp_svg.selectAll(`.pcp-axis-icon-${p}`)
                .transition().duration(500).ease(d3.easeCubicInOut)
                .attr("x", xPos - pcp_iconSize / 2)
                .attr("opacity", active ? 1 : 0)
                .style("pointer-events", active ? null : "none");
        });

        // Redraw lines using only the active principles
        const activeLine = d =>
            d3.line()(activeList.map(p => [pcp_x(p), pcp_y(d[p])]));

        pcpLinesGroup.selectAll(".pcp-country").select(".pcp-line-hover")
            .transition().duration(500).ease(d3.easeCubicInOut)
            .attr("d", activeLine)
            .attr("opacity", 1);

        pcpLinesGroup.selectAll(".pcp-country").select(".pcp-line-visible")
            .transition().duration(500).ease(d3.easeCubicInOut)
            .attr("d", activeLine)
            .attr("opacity", 0.72);
    };

    renderPCP();

    update_pcp = (country) => {
        if (country !== null) {
            const activePrinciples = new Set(filters.filter(f => f !== "overall"));

            countryLineGroups.selectAll("path").transition().duration(100)
                .attr("opacity", d => {
                    return d.country === country ? 1.0 : 0.1;
                }
                    
                );
        } else {
            countryLineGroups.selectAll("path").transition().duration(100)
                .attr("opacity", d => {
                    return 1.0;
                }
                    
                );
        }
    }

    update_map = (country) => {
        if (country !== null) {
            const activePrinciples = new Set(filters.filter(f => f !== "overall"));

            countryPaths.transition().duration(200)
                .style("stroke-width", d => {
                    console.log(d)
                    return d.properties.name === country ? 3.5 : 1.0;
                });
        } else {
            countryPaths.transition().duration(200)
                .style("stroke-width", 1.0);
        }
    }

    // ── Legend: one color swatch + name per country ──────────────────
    const pcpLegend = d3.select("#pcp-container")
        .append("div")
        .attr("class", "pcp-legend");

    se_asia.forEach(country => {
        const item = pcpLegend.append("div")
            .attr("class", "pcp-legend-item")
            .style("cursor", "pointer")
            .on("mouseover", () => {
                countryLineGroups.select(".pcp-line-visible")
                    .transition().duration(100)
                    .attr("opacity", c => c.country === country ? 1 : 0.1)
                    .attr("stroke-width", c => c.country === country ? 4.5 : 2.5);
                countryLineGroups.filter(c => c.country === country).raise();
            })
            .on("mouseout", () => {
                countryLineGroups.select(".pcp-line-visible")
                    .transition().duration(200)
                    .attr("opacity", 0.72)
                    .attr("stroke-width", 2.5);
            })
            .on("click", () => {
                window.location.href = `country.html?name=${encodeURIComponent(country)}`;
            });

        item.append("span")
            .attr("class", "pcp-legend-swatch")
            .style("background", countryColors(country));

        item.append("span")
            .attr("class", "pcp-legend-name")
            .text(country);
    });
});