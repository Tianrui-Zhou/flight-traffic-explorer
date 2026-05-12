# Thanksgiving Eve Flight Traffic Explorer

Interactive dashboard for exploring U.S. domestic flight traffic on November 26, 2025, the day before Thanksgiving and one of the busiest travel days of the year.

## Team

- Chenrui Shao
- Amanda Nilsen
- Tianrui Zhou

## Links

- **Live site:** https://cse512.pages.cs.washington.edu/26sp/a3/flights-in-the-usa/
- **Write-up:** https://cse512.pages.cs.washington.edu/26sp/a3/flights-in-the-usa/writeup.html
- **Data source:** https://www.transtats.bts.gov/Fields.asp?gnoyr_VQ=FGJ

## Files

- `index.html`, `styles.css`, `script.js` — dashboard shell and runtime
- `flight-dashboard.js` — exported Observable notebook logic
- `files/` — local CSV data files
- `writeup.html` — project write-up

## Run Locally

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Technologies

- D3.js
- Observable Plot
- HTML / CSS / JavaScript
- GitLab Pages