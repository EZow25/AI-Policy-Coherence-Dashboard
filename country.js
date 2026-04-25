/**
 * Fills out country.html's #content container with the selected country's principle scores, subprinciples scores, and policies. 
 */

// Toggle the "open" class on info boxes when their toggle button is clicked
document.querySelectorAll(".info-box-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
        toggle.closest(".info-box").classList.toggle("open");
    });
});

// ─── Data Definitions ────────────────────────────────────────────────────────

// Top-level AI principles, each with a display label and icon path
const principles = {
    p1: { label: "Transparency & Explainability", icon: "assets/transparency.svg" },
    p2: { label: "Fairness & Equity",             icon: "assets/fairness.svg"      },
    p3: { label: "Security & Safety",             icon: "assets/security.svg"      },
    p4: { label: "Human-centricity",              icon: "assets/human.svg"         },
    p5: { label: "Privacy & Data Governance",     icon: "assets/privacy.svg"       },
    p6: { label: "Accountability & Integrity",    icon: "assets/accountability.svg"},
    p7: { label: "Robustness & Reliability",      icon: "assets/robustness.svg"    },
};

// Sub-principles nested under each top-level principle (keyed by principle ID)
const subprinciples = {
    p1: {
        "p1.1": "Disclosure of AI Usage",
        "p1.2": "Disclosure of Human-AI Interaction Context & Behaviour",
        "p1.3": "Provide Explanation",
        "p1.4": "Documenting Repeatability",
        "p1.5": "Ensuring Traceability in AI System Development and Decision Making Process",
        "p1.6": "Facilitating Auditability",
        "p1.7": "AI Model Cards"
    },
    p2: {
        "p2.1": "Avoid Amplifying Bias / Discrimination",
        "p2.2": "Lifecycle Alignment with Fairness & Equity Principles",
        "p2.3": "Diverse and Representative Dataset"
    },
    p3: {
        "p3.1": "Risk Prevention Mechanism Adoption",
        "p3.2": "Disengage Mechanism Adoption",
        "p3.3": "Pre-deployment Risk Assessment",
        "p3.4": "Disclosure of Risks, Limitations, and Safeguards",
        "p3.5": "Security Measure Employment",
        "p3.6": "Safeguard Deployment",
        "p3.7": "Security Testing Employment"
    },
    p4: {
        "p4.1": "Human-centricity Lifecycle Incorporation",
        "p4.2": "Prevention of Manipulative or Malicious Use",
        "p4.3": "Labour Impact Assessment"
    },
    p5: {
        "p5.1": "Lifecycle Data Governance",
        "p5.2": "Data Transparency",
        "p5.3": "Continuous Data Governance Review",
        "p5.4": "Privacy by Design",
        "p5.5": "Privacy Enhancing Technologies"
    },
    p6: {
        "p6.1": "Accountability for Malfunction & Misuse Response",
        "p6.2": "Clear Governance & Reporting Structures",
        "p6.3": "Integrity in Design & Error Management"
    },
    p7: {
        "p7.1": "Resilience & Reliability in Dynamic Environments",
        "p7.2": "Access Control & Safeguards for Critical Systems",
        "p7.3": "Rigorous Pre-deployment Testing"
    }
};

// ─── Page Initialisation ─────────────────────────────────────────────────────

// Read the country name from the URL query string (e.g. ?name=Singapore)
const countryName = new URLSearchParams(window.location.search).get("name");
const content = document.getElementById("content");

// If no country was provided in the URL, show an error and stop
if (!countryName) {
    content.innerHTML = `<p class="not-found">No country specified.</p>`;
} else {
    document.title = `${countryName}: AI Policy Coherence`;

    // ─── Load Descriptions JSON ───────────────────────────────────────────────
    // descriptions.json holds human-readable descriptions for each principle
    // and sub-principle, used as tooltips in the UI
    d3.json("data/descriptions.json").then(descriptions => {

        // Flatten the nested descriptions structure into a single lookup array:
        // [ { label: "principle or sub-principle name", description: "..." }, ... ]
        const descs = descriptions.map(d => {
            const p = d.principle;
            const desc = d.description;
            const sps = d.subprinciples;

            // Map each sub-principle to the same { label, description } shape
            const sps_descs = sps.map(sp => {
                const label = sp.subprinciple;
                const desc = sp.description;
                return { label: label, description: desc };
            });

            // Combine the top-level principle entry with its sub-principle entries
            return [...[{ label: p, description: desc }], ...sps_descs];
        }).flat(); // Flatten so all entries sit at the same array level

        // ─── Load Scores CSV ──────────────────────────────────────────────────
        // scores.csv has a "Principle" column and one column per country
        // containing that country's coherence score for each principle/sub-principle
        d3.csv("data/scores.csv").then(rows => {

            // Build an array of top-level principle scores for the selected country
            const principleScores = Object.entries(principles).map(([key, { label, icon }]) => {
                const row = rows.find(r => r.Principle === key);
                return { key, label, icon, score: +row[countryName] }; // '+' coerces string → number
            });

            // Build a flat array of sub-principle scores for the selected country,
            // each entry retaining its parent principle key (pKey) for grouping later
            const subPScores = Object.entries(subprinciples).flatMap(([pKey, subs]) =>
                Object.entries(subs).map(([subKey, label]) => {
                    const row = rows.find(r => r.Principle === subKey);
                    return { pKey, subKey, label, score: +row[countryName] };
                })
            );

            // Guard: if no valid scores exist for this country, show an error
            const valid = principleScores.filter(p => p.score !== null);
            if (!valid.length) {
                content.innerHTML = `<p class="not-found">No data found for "${countryName}".</p>`;
                return;
            }

            // Calculate the overall coherence score as the mean of all principle scores
            const overall = Math.round(valid.reduce((s, p) => s + p.score, 0) / valid.length);

            console.log(descs);
            console.log(descs.find(d => d.label == "Disclosure of AI Usage"));

            // ─── Build Principle + Sub-principle Rows HTML ────────────────────
            const rows_html = principleScores.map(p => {

                // Filter sub-principle scores that belong to this principle
                const sub_ps = subPScores.filter(d => d.pKey === p.key);

                // Build the sub-principle table header
                let sub_ps_html = `
                    <div class="subp_row">
                        <b class="subp_label">Sub-principle</b>
                        <b class="subp_score">Score (0-3)</b>
                    </div>
                `;

                // Append a row for each sub-principle, with its description as a tooltip
                sub_ps.forEach(sp => {
                    console.log(sp);
                    sub_ps_html += `
                    <div class="subp_row">
                        <span class="subp_label" title="${descs.find(d => d.label === sp.label).description || ""}">${sp.label}</span>
                        <span class="subp_score">${sp.score}</span>
                    </div>
                `;
                });

                // Return the full HTML block for this principle and its sub-principles
                return `
                <div class="p-sp-row">
                    <div class="principle-row">
                        <img class="principle-icon" src="${p.icon}" alt="${p.label}" width=32 />
                        <!-- Principle label with description tooltip -->
                        <span class="principle-label" title="${descs.find(d => d.label === p.label).description || ""}">${p.label}</span>
                        <!-- Progress bar sized to the principle's percentage score -->
                        <div class="bar-track">
                            <div class="bar-fill" style="width: ${p.score}%;"></div>
                        </div>
                        <span class="principle-pct">${p.score}%</span>
                    </div>
                    ${sub_ps_html}
                </div>
                `;
            }).join(""); // Join all principle blocks into one HTML string

            // Render the country heading, overall score, and all principle rows
            content.innerHTML = `
                <h1>${countryName}</h1>
                <div class="overall-score">${overall}%</div>
                <div class="overall-label">Overall Coherence Score</div>
                ${rows_html}
            `;

            // ─── Load Policy Documents ────────────────────────────────────────
            // manifest.json maps each country name to an array of policy filenames
            d3.json("policies/manifest.json").then(manifest => {
                const policiesDiv = document.getElementById("policies");
                const files = manifest[countryName];

                // If no policy files are listed for this country, show a message
                if (!files || files.length === 0) {
                    policiesDiv.innerHTML = `<h3>Policies</h3><p>No policies available for ${countryName}.</p>`;
                    return;
                }

                // Build download/view links for each policy file
                const links = files.map(filename => {
                    const encoded = encodeURIComponent(filename);
                    const path = `policies/${encodeURIComponent(countryName)}/${encoded}`;
                    return `<a href="${path}" target="_blank" rel="noopener noreferrer">${filename}</a><br><br>`;
                }).join("");

                policiesDiv.innerHTML = `<h3>Policies (${files.length})</h3>${links}`;
            });

            // Scroll the country detail section into view after rendering
            document.getElementById("country-page").scrollIntoView();
        });
    });
}