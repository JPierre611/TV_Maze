const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing";
const SEARCH_SHOWS_URL = "https://api.tvmaze.com/search/shows";
const GET_EPISODES_BASE_URL = "https://api.tvmaze.com/shows/";

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const response = await axios.get(`${SEARCH_SHOWS_URL}?q=${query}`);

  let shows = response.data.map(element => {
    let show = element.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image && show.image.medium ? show.image.medium : MISSING_IMAGE_URL
    };
  });

  return shows;
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */
function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(`
      <div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
        <div class="card" data-show-id="${show.id}">
          <img class="card-img-top" src="${show.image}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">${show.summary}</p>
          </div>
        </div>
      </div>`
    );

    $showsList.append($item);
  }
}

/** Add Episodes Buttons 
 * Given the shows list, add an 'Episodes' button
 * at the bottom of each shows card.
 */
function addEpisodesBtn(shows) {
  for (const show of shows) {
    const cardDiv = document.querySelector(`div.card[data-show-id="${show.id}"]`);
    const episodesBtn = document.createElement("button");
    episodesBtn.classList.add("btn", "btn-info");
    episodesBtn.innerText = "Episodes";
    cardDiv.append(episodesBtn);
  }
  const showsList = document.querySelector("#shows-list");
  showsList.addEventListener("click", handleEpBtn);
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */
$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
  addEpisodesBtn(shows);
});

/** Handle Episodes Buttons click
 * Show episode list at the bottom of the screen.
 * Extract and use show-id stored in card div.
 */
async function handleEpBtn(evt) {
  if (evt.target.tagName !== "BUTTON") {
    return;
  }
  const cardDiv = evt.target.parentElement;
  const showId = cardDiv.dataset.showId;
  let episodes = await getEpisodes(showId);

  populateEpisodes(episodes);
}

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */
async function getEpisodes(id) {
  const response = await axios.get(`${GET_EPISODES_BASE_URL}${id}/episodes`);

  let episodes = response.data.map(element => {
    return {
      id: element.id,
      name: element.name,
      season: element.season,
      number: element.number
    };
  });

  return episodes;
}

/** Given an array of episodes info:
 *  [{id, name, season, number}], 
 *  add the list of episodes to the DOM.
 */
function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();
  for (const episode of episodes) {
    const $li = $("<li>")
      .text(`${episode.name} (season ${episode.season}, number ${episode.number})`);
    $episodesList.append($li);
  }
  $("#episodes-area").show();
}