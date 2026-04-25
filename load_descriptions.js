/**
 * Renders an accordion-style list of AI principles and their sub-principles
 * from data/descriptions.json into index.html's #principles-descriptions container.
 * Each principle appears as a collapsible box showing its description
 * and numbered sub-principles, with an icon pulled from the icons map below.
 * Icons can be found in the assets folder.
 */

// Maps each principle name to its corresponding icon asset
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

// Load principle and sub-principle descriptions from the data file
d3.json("data/descriptions.json").then(data => {
    let html_str = "";
    let p_num = 1; // Tracks the principle number for display (e.g. "1.", "2.")

    data.forEach(p => {
        const p_name = p.principle;
        const p_desc = p.description;
        const sub_ps = p.subprinciples;

        // Build the HTML for each sub-principle as a numbered paragraph
        let sub_ps_html = "";
        let sp_num = 1; // Resets to 1 for each new principle (e.g. "1.1", "1.2")
        sub_ps.forEach(sp => {
            const sp_name = sp.subprinciple;
            const sp_desc = sp.description.length > 0 ? sp.description : "No description available."; // Updates description if one does not exist for that subprinciple

            sub_ps_html += `
            <p>
                <b>${p_num}.${sp_num} ${sp_name}</b>: ${sp_desc}
            </p>
            `;
            sp_num += 1;
        });

        // Build the collapsible box for this principle, embedding the
        // sub-principles HTML generated above
        html_str += `
        <div class="principle-box">
            <h3 class="principle-box-toggle">
                <div class="icon-principle">
                    <img src="${icons[p_name]}" alt="${p_name} Icon" width=24/>
                    ${p_num}. ${p_name}
                </div>
                <span class="principle-box-arrow">▾</span>
            </h3>
            <div class="principle-box-body">    
                <p>${p_desc}</p>
                <br>
                <h4>Sub-principles</h4>
                ${sub_ps_html}
            </div>
        </div>
        `;

        p_num += 1;
    });

    // Inject all generated principle boxes into the page
    container.innerHTML = html_str;

    // Attach click listeners to each principle heading so it toggles
    // the "open" class on its parent box, showing or hiding the body
    document.querySelectorAll(".principle-box-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            toggle.closest(".principle-box").classList.toggle("open");
        });
    });
});