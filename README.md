# Thanksgiving Eve Flight Traffic Explorer

Interactive data visualization dashboard for exploring U.S. domestic flight traffic on November 26, 2025, the day before Thanksgiving and one of the busiest travel days of the year.

## Team

- Tianrui Zhou
- Chenrui Shao
- Amanda Nilsen

## Live Demo

- Dashboard: https://tianrui-zhou.github.io/flight-traffic-explorer/
- Write-up: https://tianrui-zhou.github.io/flight-traffic-explorer/writeup.html

## Data Source

- U.S. Bureau of Transportation Statistics  
  https://www.transtats.bts.gov/Fields.asp?gnoyr_VQ=FGJ

## Project Structure

- `index.html` — main dashboard page
- `styles.css` — styling and layout
- `script.js` — application runtime and interactions
- `flight-dashboard.js` — exported Observable notebook logic
- `files/` — local CSV datasets
- `writeup.html` — project write-up and design process

## Run Locally

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Technologies

- D3.js
- Observable Plot
- HTML, CSS, JavaScript
- GitHub Pages
- Interactive Data Visualization
