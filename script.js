import define from "./index.js?v=20260511-3";
import {Library, Runtime} from "./runtime.js";

const elements = {
  directionToggle: document.getElementById("direction-toggle"),
  timeChart: document.getElementById("time-chart"),
  topAirports: document.getElementById("top-airports-chart"),
  comparisonChart: document.getElementById("comparison-chart"),
  mapChart: document.getElementById("map-chart"),
  directionStatus: document.getElementById("direction-status"),
  windowStatus: document.getElementById("window-status"),
  comparisonStatus: document.getElementById("comparison-status"),
  timeSummary: document.getElementById("time-summary"),
  rankingSummary: document.getElementById("ranking-summary"),
  comparisonSummary: document.getElementById("comparison-summary"),
  mapSummary: document.getElementById("map-summary")
};

const state = {
  direction: "Departure",
  timeWindow: [6, 10],
  selectedAirports: []
};

function formatTime(value) {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function renderValue(container, value) {
  if (value == null) {
    container.replaceChildren();
    return;
  }

  if (value instanceof Node) {
    container.replaceChildren(value);
    return;
  }

  container.textContent = String(value);
}

function renderError(container, error) {
  const message = error?.message ?? String(error);
  const errorNode = document.createElement("div");
  errorNode.className = "error-state";
  errorNode.textContent = message;
  container.replaceChildren(errorNode);
}

function createMountObserver(container) {
  return {
    pending() {
      if (!container.childElementCount) {
        const loading = document.createElement("div");
        loading.className = "loading-state";
        loading.textContent = "Loading...";
        container.replaceChildren(loading);
      }
    },
    fulfilled(value) {
      renderValue(container, value);
    },
    rejected(error) {
      renderError(container, error);
      console.error(error);
    }
  };
}

function updateStatus() {
  const directionLabel = state.direction;
  const timeLabel = `${formatTime(state.timeWindow[0])} - ${formatTime(state.timeWindow[1])}`;
  const directionLower = state.direction.toLowerCase();
  const selected = state.selectedAirports;

  document.body.dataset.direction = directionLower;

  elements.directionStatus.textContent = directionLabel;
  elements.windowStatus.textContent = timeLabel;
  elements.comparisonStatus.textContent = selected.length ? selected.join(" vs ") : "Choose up to 2";

  elements.timeSummary.textContent =
    `When during the day does flight volume peak? ${directionLabel} flights are grouped in 15-minute bins.`;

  elements.rankingSummary.textContent =
    `Which airports handle the most traffic in your selected window? This ranking reflects ${directionLower} traffic within ${timeLabel}. Click bars to compare full-day airport patterns.`;

  if (selected.length === 0) {
    elements.comparisonSummary.textContent =
      "How do selected airports differ in their full-day traffic patterns? Select one or two airports from the Top 10 chart on the left to reveal them.";
  } else if (selected.length === 1) {
    elements.comparisonSummary.textContent =
      `How do selected airports differ in their full-day traffic patterns? Showing the full-day ${directionLower} curve for ${selected[0]}.`;
  } else {
    elements.comparisonSummary.textContent =
      `How do selected airports differ in their full-day traffic patterns? Comparing full-day ${directionLower} curves for ${selected[0]} and ${selected[1]}.`;
  }

  elements.mapSummary.textContent =
    `How is traffic distributed geographically across the U.S.? Circle size and color reflect ${directionLower} traffic from ${timeLabel}. Hover airports for details and use selections above to keep airports highlighted.`;
}

const runtime = new Runtime(new Library());
let unnamedCellIndex = 0;

const main = runtime.module(define, (name) => {
  if (name === "viewof direction") return createMountObserver(elements.directionToggle);
  if (name === "viewof time_window") return createMountObserver(elements.timeChart);
  if (name === "viewof selected_airport") return createMountObserver(elements.topAirports);

  if (name == null) {
    unnamedCellIndex += 1;

    if (unnamedCellIndex === 7) return createMountObserver(elements.comparisonChart);
    if (unnamedCellIndex === 9) return createMountObserver(elements.mapChart);
  }

  return undefined;
});

main.variable({
  fulfilled(value) {
    state.direction = value;
    updateStatus();
  }
}).define(["direction"], (direction) => direction);

main.variable({
  fulfilled(value) {
    state.timeWindow = value;
    updateStatus();
  }
}).define(["time_window"], (timeWindow) => timeWindow);

main.variable({
  fulfilled(value) {
    state.selectedAirports = value;
    updateStatus();
  }
}).define(["selected_airport"], (selectedAirport) => selectedAirport);

updateStatus();
