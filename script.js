// Elements
const container = document.querySelector('.movies-container');

// API key
const apiKey = "86a1d264aff49d58b5d19eac7b08daa0";

// Variables
let isLoading = false;
let displayedMovies = [];

// Functions
function resizePosters() {
  const posters = document.querySelectorAll('.poster img');
  posters.forEach(poster => {
    poster.style.height = poster.offsetWidth * 1.5 + 'px';
  });
}

function loadMovies() {
  for (let i = 0; i < 24; i++) {
    loadMovie();
  }
}

function loadMore() {
  if (isLoading) return;
  isLoading = true;
  for (let i = 0; i < 24; i++) {
    loadMovie();
  }
  isLoading = false;
}

function loadMovie() {
  const data = getRandomMovie().then(data => {
    if (data && !displayedMovies.includes(data.id)) {
      const movie = document.createElement('section');

      let heures = Math.floor(data.time / 60);
      let minutesRestantes = data.time % 60;
      let heuresFormatées = ('0' + heures).slice(-2);
      let minutesFormatées = ('0' + minutesRestantes).slice(-2);

      movie.innerHTML = `
        <div class="poster">
          <img src="https://image.tmdb.org/t/p/w500/${data.imageUrl}" alt="${data.title}">
          <p>${heuresFormatées + ':' + minutesFormatées}</p>
        </div>
        <div class="movie-infos">
          <h1>${data.title}</h1>
          <p>${data.releaseDate.substring(0, 4)} • ${data.director}</p>
        </div>
      `;

      movie.classList.add('film');
      container.appendChild(movie);
      displayedMovies.push(data.id);

      resizePosters();
    } else {
      loadMovie();
    }
  });
}

async function getRandomMovie() {
  try {
    const randomPage = Math.floor(Math.random() * 500) + 1;
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}`;
    const response = await axios.get(url);
    const randomMovie = response.data.results[Math.floor(Math.random() * 20)];

    const movieDetails = await axios.get(`https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${apiKey}&language=fr-FR`);
    const credits = await axios.get(`https://api.themoviedb.org/3/movie/${randomMovie.id}/credits?api_key=${apiKey}`);

    if (!randomMovie.poster_path || randomMovie.title === movieDetails.data.original_title || randomMovie.adult || movieDetails.data.runtime < 60) {
      return getRandomMovie();
    }

    let director = 'Réaliseur inconnu';
    for (let i = 0; i < credits.data.crew.length; i++) {
      if (credits.data.crew[i].job === 'Director') {
        director = credits.data.crew[i].name;
        break;
      }
    }

    return {
      id: randomMovie.id, // Include movie ID for checking duplicates
      title: randomMovie.title,
      releaseDate: randomMovie.release_date,
      imageUrl: randomMovie.poster_path,
      time: movieDetails.data.runtime,
      director: director
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Events
window.addEventListener('scroll', () => {
  if (isLoading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 94) {
    loadMore();
  }
});

window.addEventListener('resize', () => {
  resizePosters();
});

// Initial load
loadMovies();
