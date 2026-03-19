import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} from "./supabase-config.js?v=20260319-6";

const leaderboardElement = document.querySelector("#leaderboard");
const leaderboardStatusElement = document.querySelector("#leaderboard-status");
const leaderboardSearchInput = document.querySelector("#leaderboard-search");
const leaderboardHighlightsElement = document.querySelector("#leaderboard-highlights");

let leaderboardEntries = [];

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function formatSubmittedDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function renderLeaderboard() {
  const query = leaderboardSearchInput.value.trim().toLowerCase();
  const filteredEntries = leaderboardEntries.filter((entry) =>
    entry.player_name.toLowerCase().includes(query)
  );

  leaderboardStatusElement.textContent =
    leaderboardEntries.length === 0
      ? "No scores yet."
      : `Last update: ${new Date().toLocaleString()}`;

  leaderboardElement.innerHTML =
    filteredEntries.length === 0
      ? '<tr><td colspan="5">No matching players yet.</td></tr>'
      : filteredEntries
          .map(
            (entry, index) => `<tr>
              <td class="rank-cell">#${index + 1}</td>
              <td class="name-cell">
                <span class="player-badge">${entry.player_name.slice(0, 1).toUpperCase()}</span>
                <span>${entry.player_name}</span>
              </td>
              <td>${Number(entry.score).toFixed(1)}</td>
              <td>${Number(entry.gdp).toFixed(1)}</td>
              <td>${formatSubmittedDate(entry.created_at)}</td>
            </tr>`
          )
          .join("");

  leaderboardHighlightsElement.innerHTML =
    leaderboardEntries.length === 0
      ? "<p class=\"tile-copy\">No top players yet.</p>"
      : leaderboardEntries
          .slice(0, 3)
          .map(
            (entry, index) => `<div class="highlight-item">
              <strong>#${index + 1} ${entry.player_name}</strong>
              <span>${Number(entry.score).toFixed(1)} pts</span>
            </div>`
          )
          .join("");
}

async function loadLeaderboard() {
  if (!isSupabaseConfigured()) {
    leaderboardStatusElement.textContent =
      "Leaderboard is disabled until Supabase is configured.";
    leaderboardElement.innerHTML =
      '<tr><td colspan="5">Add Supabase credentials to enable standings.</td></tr>';
    return;
  }

  leaderboardStatusElement.textContent = "Loading latest scores...";
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from("economy_sim_scores")
    .select("player_name, score, gdp, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    leaderboardStatusElement.textContent = "Could not load leaderboard.";
    leaderboardElement.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    return;
  }

  leaderboardEntries = data;
  renderLeaderboard();
}

leaderboardSearchInput.addEventListener("input", renderLeaderboard);
loadLeaderboard();
