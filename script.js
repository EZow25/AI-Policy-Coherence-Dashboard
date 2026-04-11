// Due to having to take a couple weeks for user evaluations, I've only had time to develop the map page. 
// I feel that, including the work needed to do the eval sessions, analyze the data, and come up with solutions to problems identified from them, 
// I have achieved at least 60% of progress as specified in the assignment description, especially compared to teams who didn't do user evaluations.
// https://d3-graph-gallery.com/graph/backgroundmap_basic.html

const map_m = { top: 20, right: 20, bottom: 20, left: 20 };

const map_outerWidth = 600;
const map_outerHeight = 600;

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
    .attr("width", map_width)
    .attr("viewBox", `0 0 ${map_outerWidth} ${map_outerHeight}`);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

const projection = d3.geoNaturalEarth1()
    
const matrix_m = { top: 0, right: 0, bottom: 40, left: 80 };
const matrix_outerWidth = 800;
const matrix_outerHeight = 600;

const matrix_width = matrix_outerWidth - matrix_m.left - matrix_m.right;
const matrix_height = matrix_outerHeight - matrix_m.top - matrix_m.bottom;

const matrix_svg = d3.select("#matrix-container")
    .append("svg")
    .attr("width", matrix_width)
    .attr("viewBox", `0 0 ${matrix_outerWidth} ${matrix_outerHeight}`);

const se_asia = ["Myanmar", "Thailand", "Laos", "Vietnam", "Cambodia", "Malaysia", "Brunei", "Singapore", "Philippines", "Indonesia", "Timor-Leste"];
const principles = {"p1": "Transparency & Explainability", "p2": "Fairness & Equity", "p3": "Security & Safety", "p4": "Human-centricity", "p5": "Privacy & Data Governance", "p6": "Accountability & Integrity", "p7": "Robustness & Reliability"};

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
    console.log(scores);
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
        console.log(scores)
        render();
    }
    let renderMatrix = () => {};

    let countryPaths;
    d3.json("data/countries.geojson").then(data => {
        projection.fitExtent(
            [[map_m.left, map_m.top], [map_outerWidth - map_m.right, map_outerHeight - map_m.bottom]],
            { type: "FeatureCollection", features: data.features }
        );

        countryPaths = map_svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
                .attr("d", d3.geoPath().projection(projection))
                .attr("class", "country")
                .attr("fill", color(0))
                .style("stroke", "#000000")
                .style("stroke-width", 1);

        countryPaths.on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(200)
                .style("stroke-width", 3);
            showTooltip(event, d);
        }).on("mouseout", (event) => {
            d3.select(event.currentTarget)
                .transition().duration(200)
                .style("stroke-width", 1);
            hideTooltip();
        }).on("mousemove", (event) => {
            moveTooltip(event);
        });

        render();
    });

    function render() {
        if (!countryPaths) return;

        const countries_overall = new Map(se_asia.map(country => {
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

        // Update tooltip handler with latest data
        countryPaths.on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(200)
                .style("stroke-width", 3);
            showTooltip(event, d, countries_overall);
        });

        renderMatrix();

        function showTooltip(event, d, countries_overall) {
            let html = `<div>Coherence: ${countries_overall.get(d.properties.name)}%</div><hr>`;
            filters.forEach(f => {
                if (f === "overall") return;
                const rows = scores.get(f);
                if (!rows) return;
                html += `<div>${principles[f]}: ${rows[0][d.properties.name]}%</div>`;
            });
            tooltip
                .html(`<b>${d.properties.name}</b>` + html)
                .classed("visible", true);
            moveTooltip(event);
        }
    }

    d3.selectAll("input[type='checkbox']").on("click", update_scores);

    render();
    // https://github.com/codeforgermany/click_that_hood/blob/main/public/data/southeast-asia.geojson
    // https://github.com/johan/world.geo.json/blob/master/countries.geo.json to get Singapore
    d3.json("data/countries.geojson").then(data => {
        const p_nums = [1, 2, 3, 4, 5, 6, 7];
        const cleaned = raw.filter(d => p_nums.includes(+d.Principle.slice(1)));

        const points = cleaned.flatMap(d => se_asia.map(country => ({
            principle: principles[d.Principle],
            principleKey: d.Principle,          // ← keep the key for filter lookups
            country,
            val: +d[country]
        })));

        const x = d3.scaleBand()
            .domain(Object.values(principles))
            .range([matrix_m.left, matrix_outerWidth - matrix_m.right])
            .padding(0.1);

        const y = d3.scaleBand()
            .domain(se_asia)
            .range([matrix_m.top, matrix_outerHeight - matrix_m.bottom])
            .padding(0.1);

        const maxRadius = (Math.min(x.bandwidth(), y.bandwidth()) / 2);
        const r = d3.scaleSqrt()
            .domain([0, 100])
            .range([0, maxRadius]);

        const textColor = d3.scaleThreshold()
            .domain([50])
            .range(["#08306B", "#ffffff"]);

        const principleIcons = {
            "Transparency & Explainability": "assets/transparency.svg",
            "Fairness & Equity":             "assets/fairness.svg",
            "Security & Safety":             "assets/security.svg",
            "Human-centricity":              "assets/human.svg",
            "Privacy & Data Governance":     "assets/privacy.svg",
            "Accountability & Integrity":    "assets/accountability.svg",
            "Robustness & Reliability":      "assets/robustness.svg"
        };

        const iconSize = 30;

        // Icons & axes — built once, never change
        matrix_svg.selectAll(".x-icon")
            .data(Object.values(principles))
            .enter()
            .append("image")
            .attr("class", "x-icon")
            .attr("href", d => principleIcons[d])
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("x", d => x(d) + x.bandwidth() / 2 - iconSize / 2)
            .attr("y", matrix_height + 10)
            .append("title")
                .text(d => d);

        matrix_svg.append("g")
            .attr("transform", `translate(${matrix_m.left}, 0)`)
            .call(d3.axisLeft(y).tickSize(0))
            .call(axis => axis.select(".domain").remove());

        const cell_width = (x.range()[1] - x.range()[0]) / Object.values(principles).length;
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
            .style("font-size", "9px")
            .style("font-weight", 600)
            .style("pointer-events", "none")
            .style("fill", d => textColor(d.val));

        renderMatrix = () => {
            const activePrinciples = new Set(filters.filter(f => f !== "overall"));

            cell.transition().duration(500).ease(d3.easeCubicInOut)
                .attr("opacity", d => activePrinciples.has(d.principleKey) ? 1 : 0.15);

            matrix_svg.selectAll(".x-icon")
                .transition().duration(500).ease(d3.easeCubicInOut)
                .attr("opacity", d => {
                    const key = Object.keys(principles).find(k => principles[k] === d);
                    return activePrinciples.has(key) ? 1 : 0.15;
                });
        };

        renderMatrix();
    });
});