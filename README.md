# AI-Policy-Coherence-Dashboard
The dashboard visualizes quantitative data representing how strongly Southeast Asian countries adhere to regional AI governance principles, outlined by the ASEAN Guide on AI Governance and Ethics (https://asean.org/book/asean-guide-on-ai-governance-and-ethics/)

## Project Structure
```ini
.
├─ assets - stores image files, mainly principle icons
├─ data
│  ├─ countries.geojson - geographic data to build the map
│  ├─ descriptions.json - stores descriptions for principles and subprinciples
│  ├─ quotes.json - stores policy quotes, needs to be filled
│  ├─ scores.csv - stores principle and subprinciples scores for each country
├─ .gitattributes
├─ README.md
├─ country.html - HTML template for each country's page
├─ country.js - Fills country.html with the selected country's information
├─ index.html - Landing page
├─ load_descriptions.js - Updates the "What are the AI Governance Principles?" dropdowns
├─ script.js - Builds the heatmap, matrix, and parallel coordinate plot in the dashboard
├─ style.css
```
