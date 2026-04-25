const icons = {
    "Transparency & Explainability": "assets/transparency.svg",
    "Fairness & Equity":             "assets/fairness.svg",
    "Security & Safety":             "assets/security.svg",
    "Human-centricity":              "assets/human.svg",
    "Privacy & Data Governance":     "assets/privacy.svg",
    "Accountability & Integrity":    "assets/accountability.svg",
    "Robustness & Reliability":      "assets/robustness.svg"
};

const container = document.getElementById("principles-descriptions");
d3.json("data/descriptions.json").then(data => {
    let html_str = ""
    let p_num = 1
    
    data.forEach(p => {
        const p_name = p.principle;
        const p_desc = p.description;
        const sub_ps = p.subprinciples;
        let sub_ps_html = "";
        let sp_num = 1
        sub_ps.forEach(sp => {
            const sp_name = sp.subprinciple;
            const sp_desc = sp.description;

            sub_ps_html += `
            <p>
                <b>${p_num}.${sp_num} ${sp_name}</b>: ${sp_desc}
            </p>
            `
            sp_num += 1
        })

        html_str += `
        <div class="principle-box">
            <div class="principle-box">
                <h3 class="principle-box-toggle">
                    <div class="icon-principle">
                        <img src="${icons[p_name]}" alt="${p_name} Icon" width=24/>
                        ${p_num}. ${p_name}
                    </div>
                    <span class="principle-box-arrow">▾</span>
                </h3>
                <div class="principle-box-body">    
                    <p>
                        ${p_desc}
                    </p>
                    <br>
                    <h4>Sub-principles</h4>
                    ${sub_ps_html}
                </div>
            </div>
        </div>
        `

        p_num += 1
    });

    container.innerHTML = html_str;
    document.querySelectorAll(".principle-box-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            toggle.closest(".principle-box").classList.toggle("open");
        });
    });
});