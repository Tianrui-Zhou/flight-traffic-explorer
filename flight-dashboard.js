function _1(md){return(
md`# Our project as of 5/10 `
)}

function _2(md){return(
md`Import`
)}

function _topojson(require){return(
require("topojson-client")
)}

function _us(d3){return(
d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
)}

function _nation(topojson,us){return(
topojson.feature(us, us.objects.nation)
)}

function _statemesh(topojson,us){return(
topojson.mesh(us, us.objects.states, (a, b) => a !== b)
)}

function _airport_info_20251126(__query,FileAttachment,invalidation){return(
__query(FileAttachment("airport_info_2025-11-26.csv"),{from:{table:"airport_info_2025-11-26"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _flights_20251126(__query,FileAttachment,invalidation){return(
__query(FileAttachment("flights_2025-11-26.csv"),{from:{table:"flights_2025-11-26"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _airport_cache(FileAttachment){return(
FileAttachment("airport_info_2025-11-26.csv").csv({typed: true})
)}

function _flights(FileAttachment){return(
FileAttachment("flights_2025-11-26.csv").csv({typed: true})
)}

function _11(md){return(
md`### Explore by Flight Direction`
)}

function _direction(html,Event)
{
  const div = html`<div style="
    display: inline-flex;
    gap: 6px;
    padding: 6px;
    border-radius: 999px;
    background: #f1f3f5;
    font-family: sans-serif;
  ">
    <button data-value="Departure">Departure</button>
    <button data-value="Arrival">Arrival</button>
  </div>`;

  div.value = "Departure";

  const buttons = div.querySelectorAll("button");

  function update() {
    buttons.forEach(button => {
      const active = button.dataset.value === div.value;
      button.style.padding = "8px 18px";
      button.style.border = "none";
      button.style.borderRadius = "999px";
      button.style.cursor = "pointer";
      button.style.fontWeight = active ? "700" : "500";
      button.style.background = active
        ? div.value === "Departure" ? "#1F7A3A" : "#2459A6"
        : "transparent";
      button.style.color = active ? "white" : "#333";
    });
  }

  buttons.forEach(button => {
    button.onclick = () => {
      div.value = button.dataset.value;
      update();
      div.dispatchEvent(new Event("input"));
    };
  });

  update();
  return div;
}


function _airportColumn(direction){return(
direction === "Departure" ? "ORIGIN_IATA" : "DEST_IATA"
)}

function _timeColumn(direction){return(
direction === "Departure" ? "DEP_TIME" : "ARR_TIME"
)}

function _airport_totals(d3,flights,airportColumn){return(
d3.rollups(
  flights,
  rows => rows.length,
  row => row[airportColumn]
).map(([IATA, flights]) => ({IATA, flights}))
)}

function _airportByIata(airport_cache){return(
new Map(airport_cache.map(row => [row.IATA, row]))
)}

function _airportNames(){return(
new Map([
  ["ATL", "Hartsfield-Jackson Atlanta International Airport"],
  ["SEA", "Seattle-Tacoma International Airport"],
  ["DEN", "Denver International Airport"],
  ["ORD", "Chicago O'Hare International Airport"],
  ["DFW", "Dallas/Fort Worth International Airport"],
  ["LAX", "Los Angeles International Airport"],
  ["JFK", "John F. Kennedy International Airport"],
  ["SFO", "San Francisco International Airport"],
  ["LAS", "Harry Reid International Airport"],
  ["CLT", "Charlotte Douglas International Airport"],
  ["PHX", "Phoenix Sky Harbor International Airport"],
  ["BOS", "Boston Logan International Airport"],
  ["MIA", "Miami International Airport"],
  ["MSP", "Minneapolis-Saint Paul International Airport"]
])
)}

function _airport_points(airport_totals,airportByIata){return(
airport_totals.map(
  row => {
    const airport = airportByIata.get(row.IATA);
    return airport
    ? {
        IATA: row.IATA,
        flights: row.flights,
        LONGITUDE: airport.LONGITUDE,
        LATITUDE: airport.LATITUDE,
        ICAO: airport.ICAO,
        AIRPORT_ID: airport.AIRPORT_ID
      }
    : null;
  }
)
)}

function _max_flights(d3,airport_points){return(
d3.max(airport_points, d => d.flights)
)}

function _radius(d3,max_flights){return(
d3.scaleSqrt()
  .domain([0, max_flights])
  .range([1000, 100000])
)}

function _flight_hour_data(flights,timeColumn){return(
flights.map(
  d => {
    const time = Number(d[timeColumn])
    const hour = Math.floor(time / 100)
    const time_decimal = hour + ((time - hour * 100) / 60 * 100) / 100
    return {
      ...d,
      hour,
      time_decimal
    };
  }
)
)}

function _hourly_counts(d3,flight_hour_data)
{
  const bin_size_hr = 0.25;
  const counts = d3.rollup(
    flight_hour_data,
    rows => rows.length,
    d => Math.floor(d.time_decimal / bin_size_hr) * bin_size_hr
  );

  return d3.range(0, 24, bin_size_hr).map(start => ({
    start,
    end: start + bin_size_hr,
    flights: counts.get(start) ?? 0
  }));
}


function _time_step(){return(
0.25
)}

function _formatTime(){return(
t => {
  const hour = Math.floor(t);
  const minute = Math.round((t - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
)}

function _25(md){return(
md`## Flight Volume by Time of Day`
)}

function _time_window(direction,html,d3,hourly_counts,formatTime,Event)
{
  const width = 820;
  const height = 320;
  const marginTop = 32;
  const marginRight = 24;
  const marginBottom = 58;
  const marginLeft = 68;
  const bin = 0.25;

  const mainColor = direction === "Departure" ? "#5F9E6E" : "#5F7FAE";
  const selectedColor = direction === "Departure" ? "#1F7A3A" : "#2459A6";

  const div = html`<div>
    <button id="play-button" style="
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #aaa;
      background: white;
      cursor: pointer;
      margin-bottom: 8px;
    ">▶ Play</button>

    <span id="range-label" style="font-weight: 600; margin-left: 12px;"></span>

    <div style="font-size: 15px; margin: 6px 0 10px 0; color: #555;">
      Drag across the chart to select a time window, or drag the window edges to adjust the range. Press play to animate the selected window.
    </div>
  </div>`;

  div.value = [6, 10];

  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "auto")
    .style("font-family", "sans-serif");

  const x = d3.scaleLinear()
    .domain([0, 24])
    .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(hourly_counts, d => d.flights)])
    .nice()
    .range([height - marginBottom, marginTop]);

  const bars = svg.append("g")
    .selectAll("rect")
    .data(hourly_counts)
    .join("rect")
    .attr("x", d => x(d.start))
    .attr("y", d => y(d.flights))
    .attr("width", d => x(d.end) - x(d.start) - 1)
    .attr("height", d => y(0) - y(d.flights))
    .attr("fill", mainColor)
    .attr("opacity", 0.35);

  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickValues(d3.range(0, 25, 1)));

  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 18)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", 16)
    .text("Time of Day");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", 25)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", 16)
    .text("Number of Flights");

  function roundToStep(value) {
    return Math.max(0, Math.min(24, Math.round(value / bin) * bin));
  }

  function updateView(range) {
    div.value = range;

    div.querySelector("#range-label").textContent =
      `Selected: ${formatTime(range[0])} – ${formatTime(range[1])}`;

    bars
      .attr("fill", d =>
        d.start >= range[0] && d.start < range[1] ? selectedColor : mainColor
      )
      .attr("opacity", d =>
        d.start >= range[0] && d.start < range[1] ? 0.95 : 0.22
      );

    div.dispatchEvent(new Event("input"));
  }

  const brush = d3.brushX()
    .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
    .on("brush end", ({selection}) => {
      if (!selection) {
        updateView([0, 24]);
      } else {
        let range = selection.map(x.invert).map(roundToStep);
        if (range[0] === range[1]) range[1] = Math.min(24, range[0] + bin);
        updateView(range);
      }
    });

  const brushG = svg.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, [x(div.value[0]), x(div.value[1])]);

  svg.selectAll(".selection")
    .attr("fill", "#4C78A8")
    .attr("fill-opacity", 0.12)
    .attr("stroke", "#4C78A8")
    .attr("stroke-width", 2);

  let playing = false;
  let timer;

  div.querySelector("#play-button").onclick = () => {
    playing = !playing;
    div.querySelector("#play-button").textContent = playing ? "⏸ Pause" : "▶ Play";

    if (playing) {
      timer = setInterval(() => {
        const windowSize = div.value[1] - div.value[0];
        let nextStart = div.value[0] + bin;

        if (nextStart + windowSize > 24) nextStart = 0;

        const nextRange = [nextStart, nextStart + windowSize];
        brushG.call(brush.move, nextRange.map(x));
      }, 350);
    } else {
      clearInterval(timer);
    }
  };

  updateView(div.value);

  div.appendChild(svg.node());
  return div;
}


function _start_time(time_window){return(
time_window[0]
)}

function _end_time(time_window){return(
time_window[1]
)}

function _filtered_flights(flight_hour_data,start_time,end_time){return(
flight_hour_data.filter(
  d => d.time_decimal >= start_time && d.time_decimal < end_time
)
)}

function _airport_totals_filtered(d3,filtered_flights,airportColumn){return(
d3.rollups(
  filtered_flights,
  rows => rows.length,
  row => row[airportColumn]
).map(([IATA, flights]) => ({IATA, flights}))
)}

function _airport_points_filtered(airport_totals_filtered,airportByIata){return(
airport_totals_filtered.map(
  row => {
    const airport = airportByIata.get(row.IATA);
    return airport
    ? {
        IATA: row.IATA,
        flights: row.flights,
        LONGITUDE: airport.LONGITUDE,
        LATITUDE: airport.LATITUDE,
        ICAO: airport.ICAO,
        AIRPORT_ID: airport.AIRPORT_ID
      }
    : null;
  }
)
)}

function _top_airports(airport_points_filtered,d3){return(
airport_points_filtered
  .filter(d => d && d.flights > 0)
  .sort((a, b) => d3.descending(a.flights, b.flights))
  .slice(0, 10)
)}

function _33(md,direction,formatTime,start_time,end_time){return(
md`## Top 10 Airports by ${direction} Flights from ${formatTime(start_time)} to ${formatTime(end_time)}`
)}

function _selected_airport(direction,html,d3,top_airports,Event)
{
  const width = 600;
  const height = 300;
  const marginLeft = 66;
  const marginRight = 64;
  const marginTop = 20;
  const marginBottom = 52;

  const baseColor = direction === "Departure" ? "#BFD8C5" : "#C7D3E3";
  const hoverColor = direction === "Departure" ? "#5F9E6E" : "#5F7FAE";
  const selectedColors = direction === "Departure"
      ? ["#1F7A3A", "#C96B00"]
      : ["#2459A6", "#D97706"];

  const div = html`<div>
    <div style="font-size: 14px; color: #555; margin-bottom: 8px;">
      Hover to highlight. Click up to two airports to compare their full-day patterns.
      <span id="selected-label" style="font-weight: 600; color: #333; margin-left: 8px;"></span>
    </div>
  </div>`;

  div.value = [];

  const x = d3.scaleLinear()
    .domain([0, d3.max(top_airports, d => d.flights)])
    .nice()
    .range([marginLeft, width - marginRight]);

  const y = d3.scaleBand()
    .domain(top_airports.map(d => d.IATA))
    .range([marginTop, height - marginBottom])
    .padding(0.3);

  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "auto")
    .style("font-family", "sans-serif");

  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(6));

  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", 13)
    .text(`Number of ${direction} Flights`);

  function colorForAirport(iata) {
    const index = div.value.indexOf(iata);
    return index >= 0 ? selectedColors[index] : baseColor;
  }

  function opacityForAirport(iata) {
    if (div.value.length === 0) return 0.9;
    return div.value.includes(iata) ? 1 : 0.45;
  }

  function updateBars() {
    div.querySelector("#selected-label").textContent =
      div.value.length ? `Selected: ${div.value.join(" vs ")}` : "";

    bars
      .interrupt()
      .transition()
      .duration(160)
      .attr("fill", d => colorForAirport(d.IATA))
      .attr("opacity", d => opacityForAirport(d.IATA));
  }

  const bars = svg.append("g")
    .selectAll("rect")
    .data(top_airports)
    .join("rect")
    .attr("x", marginLeft)
    .attr("y", d => y(d.IATA))
    .attr("width", d => x(d.flights) - marginLeft)
    .attr("height", y.bandwidth())
    .attr("rx", 5)
    .attr("fill", baseColor)
    .attr("opacity", 0.9)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .interrupt()
        .transition()
        .duration(100)
        .attr("fill", div.value.includes(d.IATA) ? colorForAirport(d.IATA) : hoverColor)
        .attr("opacity", 1);
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .interrupt()
        .transition()
        .duration(100)
        .attr("fill", colorForAirport(d.IATA))
        .attr("opacity", opacityForAirport(d.IATA));
    })
    .on("click", function(event, d) {
      const iata = d.IATA;

      if (div.value.includes(iata)) {
        div.value = div.value.filter(v => v !== iata);
      } else if (div.value.length < 2) {
        div.value = [...div.value, iata];
      } else {
        div.value = [div.value[1], iata];
      }

      updateBars();
      div.dispatchEvent(new Event("input"));
    });

  svg.append("g")
    .selectAll("text")
    .data(top_airports)
    .join("text")
    .attr("x", d => x(d.flights) + 6)
    .attr("y", d => y(d.IATA) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("font-size", 10)
    .attr("fill", "#333")
    .text(d => d.flights);

  div.appendChild(svg.node());
  return div;
}


function _35(md,selected_airport,direction){return(
md`## ${
  selected_airport.length === 0
    ? "Click up to Two Top Airports to Compare Full-Day Patterns"
    : selected_airport.length === 1
      ? `${selected_airport[0]} ${direction} Pattern Throughout the Day`
      : `${selected_airport[0]} vs ${selected_airport[1]} ${direction} Patterns Throughout the Day`
}`
)}

function _selected_airport_hourly_counts(selected_airport,flight_hour_data,airportColumn,d3)
{
  if (!selected_airport.length) return [];

  const bin_size_hr = 1;

  return selected_airport.flatMap(iata => {
    const selectedFlights = flight_hour_data.filter(
      d => d[airportColumn] === iata
    );

    const counts = d3.rollup(
      selectedFlights,
      rows => rows.length,
      d => Math.floor(d.time_decimal / bin_size_hr) * bin_size_hr
    );

    return d3.range(0, 24, bin_size_hr).map(start => ({
      airport: iata,
      start,
      end: start + bin_size_hr,
      flights: counts.get(start) ?? 0
    }));
  });
}


function _37(selected_airport,Plot,direction,d3,selected_airport_hourly_counts,md){return(
selected_airport.length
  ? Plot.plot({
      width: 680,
      height: 280,
      marginLeft: 72,
      marginBottom: 56,
      style: {
        fontSize: "14px"
      },
      color: {
        domain: selected_airport,
        range: direction === "Departure"
          ? ["#1F7A3A", "#C96B00"]
          : ["#2459A6", "#D97706"],
        legend: true
      },
      x: {
        domain: [0, 24],
        ticks: d3.range(0, 25, 2),
        label: "Time of Day"
      },
      y: {
        grid: true,
        label: `Number of ${direction} Flights`
      },
      marks: [
        Plot.lineY(selected_airport_hourly_counts, {
          x: "start",
          y: "flights",
          stroke: "airport",
          strokeWidth: 2.2,
          strokeOpacity: 0.82,
          curve: "catmull-rom",
          tip: true
        }),
        Plot.dot(selected_airport_hourly_counts, {
          x: "start",
          y: "flights",
          fill: "airport",
          r: 1.5,
          fillOpacity: 0.75,
          tip: true
        }),
        Plot.ruleY([0])
      ]
    })
  : null
)}

function _38(md,direction,formatTime,start_time,end_time){return(
md`## U.S. Airport ${direction} Traffic from ${formatTime(start_time)} to ${formatTime(end_time)}`
)}

function _39(Plot,direction,d3,airport_points_filtered,nation,statemesh,selected_airport,airportNames,formatTime,start_time,end_time){return(
(() => {
  const selectedAirportPoints = airport_points_filtered.filter(d =>
  selected_airport.includes(d.IATA)
  );

  const backgroundLabelPoints = selected_airport.length
    ? []
    : airport_points_filtered.filter(d => d.flights >= 50);

  return Plot.plot({
  projection: "albers-usa",
  width: 1100,
  height: 650,
  color: {
    type: "threshold",
    domain: [50, 100, 200, 300, 400, 600],
    scheme: direction === "Arrival" ? "blues" : "greens",
    label: direction === "Arrival"
      ? "Number of Flights Arrived"
      : "Number of Flights Departed",
    legend: true
  },
  r: {
    type: "sqrt",
    domain: [0, d3.max(airport_points_filtered, d => d.flights)],
    range: [3, 34]
  },
  marks: [
    Plot.geo(nation, {fill: "#eeeeee"}),

    Plot.geo(statemesh, {stroke: "#c7c7c7", strokeWidth: 0.6}),

    Plot.dot(
      airport_points_filtered.filter(d => !selected_airport.includes(d.IATA)),
      {
        x: "LONGITUDE",
        y: "LATITUDE",
        r: "flights",
        fill: selected_airport.length ? "#BFC4CA" : "flights",
        stroke: "white",
        strokeWidth: 1,
        opacity: selected_airport.length ? 0.75 : 0.78,
        title: d => selected_airport.length
          ? null
          : `${d.IATA} — ${airportNames.get(d.IATA) ?? "Airport"}\n${direction} Flights: ${d.flights}\nTime Window: ${formatTime(start_time)} – ${formatTime(end_time)}`,
        tip: selected_airport.length ? false : true
      }
    ),
    
    Plot.dot(
      airport_points_filtered.filter(d => selected_airport.includes(d.IATA)),
      {
        x: "LONGITUDE",
        y: "LATITUDE",
        r: "flights",
        fill: "flights",
        stroke: d => {
          const selectedColors = direction === "Departure"
            ? ["#1F7A3A", "#C96B00"]
            : ["#2459A6", "#D97706"];
          return selectedColors[selected_airport.indexOf(d.IATA)] ?? selectedColors[0];
        },
        strokeWidth: 4,
        opacity: 1,
        title: d =>
          `${d.IATA} — ${airportNames.get(d.IATA) ?? "Airport"}\n${direction} Flights: ${d.flights}\nTime Window: ${formatTime(start_time)} – ${formatTime(end_time)}`,
        tip: true
      }
    ),

    Plot.text(
      backgroundLabelPoints,
      {
        x: "LONGITUDE",
        y: "LATITUDE",
        text: d => d.IATA,
        fontSize: 10,
        fontWeight: "normal",
        fill: "#1f1f1f",
        stroke: "white",
        strokeWidth: 2,
        paintOrder: "stroke",
        dy: -18
      }
    ),

    Plot.text(
      selectedAirportPoints,
      {
        x: "LONGITUDE",
        y: "LATITUDE",
        text: d => d.IATA,
        fontSize: 13,
        fontWeight: "bold",
        fill: "#1f1f1f",
        stroke: "white",
        strokeWidth: 2,
        paintOrder: "stroke",
        dy: -18
      }
    )
  ]
  });
})()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["airport_info_2025-11-26.csv", {url: new URL("./files/76256728516e364628c62f168a17e3dae70a35fd851637b08abb03e8514ee23f850e7ac548ee74ca649fab93f37fd274286b0ad247885491abf4284236f90f7e.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["flights_2025-11-26.csv", {url: new URL("./files/321bf2a16c9d705b30e06504eb47b6e783fe09138987cad5b585befcd92f08afa9573c19ef1a6c68c089656939ef7c2f58704c00de71f91c1f7910a6328e33bc.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("topojson")).define("topojson", ["require"], _topojson);
  main.variable(observer("us")).define("us", ["d3"], _us);
  main.variable(observer("nation")).define("nation", ["topojson","us"], _nation);
  main.variable(observer("statemesh")).define("statemesh", ["topojson","us"], _statemesh);
  main.variable(observer("airport_info_20251126")).define("airport_info_20251126", ["__query","FileAttachment","invalidation"], _airport_info_20251126);
  main.variable(observer("flights_20251126")).define("flights_20251126", ["__query","FileAttachment","invalidation"], _flights_20251126);
  main.variable(observer("airport_cache")).define("airport_cache", ["FileAttachment"], _airport_cache);
  main.variable(observer("flights")).define("flights", ["FileAttachment"], _flights);
  main.variable(observer()).define(["md"], _11);
  main.variable(observer("viewof direction")).define("viewof direction", ["html","Event"], _direction);
  main.variable(observer("direction")).define("direction", ["Generators", "viewof direction"], (G, _) => G.input(_));
  main.variable(observer("airportColumn")).define("airportColumn", ["direction"], _airportColumn);
  main.variable(observer("timeColumn")).define("timeColumn", ["direction"], _timeColumn);
  main.variable(observer("airport_totals")).define("airport_totals", ["d3","flights","airportColumn"], _airport_totals);
  main.variable(observer("airportByIata")).define("airportByIata", ["airport_cache"], _airportByIata);
  main.variable(observer("airportNames")).define("airportNames", _airportNames);
  main.variable(observer("airport_points")).define("airport_points", ["airport_totals","airportByIata"], _airport_points);
  main.variable(observer("max_flights")).define("max_flights", ["d3","airport_points"], _max_flights);
  main.variable(observer("radius")).define("radius", ["d3","max_flights"], _radius);
  main.variable(observer("flight_hour_data")).define("flight_hour_data", ["flights","timeColumn"], _flight_hour_data);
  main.variable(observer("hourly_counts")).define("hourly_counts", ["d3","flight_hour_data"], _hourly_counts);
  main.variable(observer("time_step")).define("time_step", _time_step);
  main.variable(observer("formatTime")).define("formatTime", _formatTime);
  main.variable(observer()).define(["md"], _25);
  main.variable(observer("viewof time_window")).define("viewof time_window", ["direction","html","d3","hourly_counts","formatTime","Event"], _time_window);
  main.variable(observer("time_window")).define("time_window", ["Generators", "viewof time_window"], (G, _) => G.input(_));
  main.variable(observer("start_time")).define("start_time", ["time_window"], _start_time);
  main.variable(observer("end_time")).define("end_time", ["time_window"], _end_time);
  main.variable(observer("filtered_flights")).define("filtered_flights", ["flight_hour_data","start_time","end_time"], _filtered_flights);
  main.variable(observer("airport_totals_filtered")).define("airport_totals_filtered", ["d3","filtered_flights","airportColumn"], _airport_totals_filtered);
  main.variable(observer("airport_points_filtered")).define("airport_points_filtered", ["airport_totals_filtered","airportByIata"], _airport_points_filtered);
  main.variable(observer("top_airports")).define("top_airports", ["airport_points_filtered","d3"], _top_airports);
  main.variable(observer()).define(["md","direction","formatTime","start_time","end_time"], _33);
  main.variable(observer("viewof selected_airport")).define("viewof selected_airport", ["direction","html","d3","top_airports","Event"], _selected_airport);
  main.variable(observer("selected_airport")).define("selected_airport", ["Generators", "viewof selected_airport"], (G, _) => G.input(_));
  main.variable(observer()).define(["md","selected_airport","direction"], _35);
  main.variable(observer("selected_airport_hourly_counts")).define("selected_airport_hourly_counts", ["selected_airport","flight_hour_data","airportColumn","d3"], _selected_airport_hourly_counts);
  main.variable(observer()).define(["selected_airport","Plot","direction","d3","selected_airport_hourly_counts","md"], _37);
  main.variable(observer()).define(["md","direction","formatTime","start_time","end_time"], _38);
  main.variable(observer()).define(["Plot","direction","d3","airport_points_filtered","nation","statemesh","selected_airport","airportNames","formatTime","start_time","end_time"], _39);
  return main;
}
