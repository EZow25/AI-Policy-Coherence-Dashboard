const principles = {
    p1: { label: "Transparency & Explainability", icon: "assets/transparency.svg" },
    p2: { label: "Fairness & Equity",             icon: "assets/fairness.svg"      },
    p3: { label: "Security & Safety",             icon: "assets/security.svg"      },
    p4: { label: "Human-centricity",              icon: "assets/human.svg"         },
    p5: { label: "Privacy & Data Governance",     icon: "assets/privacy.svg"       },
    p6: { label: "Accountability & Integrity",    icon: "assets/accountability.svg"},
    p7: { label: "Robustness & Reliability",      icon: "assets/robustness.svg"    },
};

const countryName = new URLSearchParams(window.location.search).get("name");
const content = document.getElementById("content");

if (!countryName) {
    content.innerHTML = `<p class="not-found">No country specified.</p>`;
} else {
    document.title = `${countryName}: AI Policy Coherence`;

    d3.csv("data/scores.csv").then(rows => {
        const principleScores = Object.entries(principles).map(([key, { label, icon }]) => {
            const row = rows.find(r => r.Principle === key);
            return { key, label, icon, score: row ? +row[countryName] : null };
        });

        const valid = principleScores.filter(p => p.score !== null);
        if (!valid.length) {
            content.innerHTML = `<p class="not-found">No data found for "${countryName}".</p>`;
            return;
        }

        const overall = Math.round(valid.reduce((s, p) => s + p.score, 0) / valid.length);

        const rows_html = principleScores.map(p => `
            <div class="principle-row">
            <img class="principle-icon" src="${p.icon}" title="${p.label}" />
            <span class="principle-label">${p.label}</span>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${p.score}%;"></div>
            </div>
            <span class="principle-pct">${p.score}%</span>
            </div>
        `).join("");

        content.innerHTML = `
            <h1>${countryName}</h1>
            <div class="overall-score">${overall}%</div>
            <div class="overall-label">Overall Coherence Score</div>
            ${rows_html}
        `;

        
    });
}