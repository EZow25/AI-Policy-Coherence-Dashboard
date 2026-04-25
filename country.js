document.querySelectorAll(".info-box-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
        toggle.closest(".info-box").classList.toggle("open");
    });
});

const principles = {
    p1: { label: "Transparency & Explainability", icon: "assets/transparency.svg" },
    p2: { label: "Fairness & Equity",             icon: "assets/fairness.svg"      },
    p3: { label: "Security & Safety",             icon: "assets/security.svg"      },
    p4: { label: "Human-centricity",              icon: "assets/human.svg"         },
    p5: { label: "Privacy & Data Governance",     icon: "assets/privacy.svg"       },
    p6: { label: "Accountability & Integrity",    icon: "assets/accountability.svg"},
    p7: { label: "Robustness & Reliability",      icon: "assets/robustness.svg"    },
};

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
        "p2.1": "Avoid Amplifying Bias / Discrimination" ,
        "p2.2": "Lifecycle Alignment with Fairness & Equity Principles" ,
        "p2.3": "Diverse and Representative Dataset"
    } ,

    p3:
    {"p3.1": "Risk Prevention Mechanism Adoption" ,
    "p3.2": "Disengage Mechanism Adoption" ,
    "p3.3": "Pre-deployment Risk Assessment" ,
    "p3.4": "Disclosure of Risks, Limitations, and Safeguards" ,
    "p3.5": "Security Measure Employment" ,
    "p3.6": "Safeguard Deployment" ,
    "p3.7": "Security Testing Employment"},

    p4: 
    {"p4.1": "Human-centricity Lifecycle Incorporation",
    "p4.2": "Prevention of Manipulative or Malicious Use",
    "p4.3": "Labour Impact Assessment"},

    p5:
    {"p5.1": "Lifecycle Data Governance",
    "p5.2": "Data Transparency",
    "p5.3": "Continuous Data Governance Review",
    "p5.4": "Privacy by Design",
    "p5.5": "Privacy Enhancing Technologies"},

    p6:
    {"p6.1": "Accountability for Malfunction & Misuse Response",
    "p6.2": "Clear Governance & Reporting Structures",
    "p6.3": "Integrity in Design & Error Management"},

    p7:
    {"p7.1": "Resilience & Reliability in Dynamic Environments",
    "p7.2": "Access Control & Safeguards for Critical Systems",
    "p7.3": "Rigorous Pre-deployment Testing"}
};

const countryName = new URLSearchParams(window.location.search).get("name");
const content = document.getElementById("content");

if (!countryName) {
    content.innerHTML = `<p class="not-found">No country specified.</p>`;
} else {
    document.title = `${countryName}: AI Policy Coherence`;

    d3.json("data/descriptions.json").then(descriptions => {
        const descs = descriptions.map(d => {
            const p = d.principle;
            const desc = d.description;
            const sps = d.subprinciples;

            const sps_descs = sps.map(sp => {
                const label = sp.subprinciple
                const desc = sp.description
                return {label: label, description: desc};
            })
            return [...[{label: p, description: desc}], ...sps_descs]
        }).flat();

        d3.csv("data/scores.csv").then(rows => {
        const principleScores = Object.entries(principles).map(([key, { label, icon }]) => {
            const row = rows.find(r => r.Principle === key);
            return { key, label, icon, score: +row[countryName] };
        });

        const subPScores = Object.entries(subprinciples).flatMap(([pKey, subs]) =>
            Object.entries(subs).map(([subKey, label]) => {
                const row = rows.find(r => r.Principle === subKey);
                return { pKey, subKey, label, score: +row[countryName] };
            })
        );

        const valid = principleScores.filter(p => p.score !== null);
        if (!valid.length) {
            content.innerHTML = `<p class="not-found">No data found for "${countryName}".</p>`;
            return;
        }

        const overall = Math.round(valid.reduce((s, p) => s + p.score, 0) / valid.length);

        console.log(descs)
        console.log(descs.find(d => d.label == "Disclosure of AI Usage"))
        const rows_html = principleScores.map(p => {
            const sub_ps = subPScores.filter(d => d.pKey === p.key)
            let sub_ps_html = `
                <div class="subp_row">
                    <b class="subp_label">Sub-principle</b>
                    <b class="subp_score">Score (0-3)</b>
                </div>
            `;
            sub_ps.forEach(sp => {
                console.log(sp)
                sub_ps_html += `
                <div class="subp_row">
                    <span class="subp_label" title="${descs.find(d => d.label === sp.label).description || ""}">${sp.label}</span>
                    <span class="subp_score">${sp.score}</span>
                </div>
            `
            })
            
            return `
            <div class="p-sp-row">
                <div class="principle-row">
                    <img class="principle-icon" src="${p.icon}" alt="${p.label}" width=32 />
                    <span class="principle-label" title="${descs.find(d => d.label === p.label).description || ""}">${p.label}</span>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${p.score}%;"></div>
                    </div>
                    <span class="principle-pct">${p.score}%</span>
                </div>
                ${sub_ps_html}
            </div>
            `}).join("");

        content.innerHTML = `
            <h1>${countryName}</h1>
            <div class="overall-score">${overall}%</div>
            <div class="overall-label">Overall Coherence Score</div>
            ${rows_html}
        `;

        d3.json("policies/manifest.json").then(manifest => {
            const policiesDiv = document.getElementById("policies");
            const files = manifest[countryName];

            if (!files || files.length === 0) {
                policiesDiv.innerHTML = `<h3>Policies</h3><p>No policies available for ${countryName}.</p>`;
                return;
            }

            const links = files.map(filename => {
                const encoded = encodeURIComponent(filename);
                const path = `policies/${encodeURIComponent(countryName)}/${encoded}`;
                return `<a href="${path}" target="_blank" rel="noopener noreferrer">${filename}</a><br><br>`;
            }).join("");

            policiesDiv.innerHTML = `<h3>Policies (${files.length})</h3>${links}`;
        });

        document.getElementById("country-page").scrollIntoView();
    });
    });
    
}