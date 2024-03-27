// Elements
const container = document.querySelector('.movies-container');

// API key
const apiKey = "86a1d264aff49d58b5d19eac7b08daa0";

// Variables
let isLoading = false;
let displayedMovies = [];
let filters = "all";

const correspondances = {
  "action": "28",
  "aventure": "12",
  "animation": "16",
  "comedie": "35",
  "crime": "80",
  "documentaire": "99",
  "drame": "18",
  "famille": "10751",
  "fantastique": "14",
  "histoire": "36",
  "horreur": "27",
  "musique": "10402",
  "mystere": "9648",
  "romance": "10749",
  "science-fiction": "878",
  "telefilm": "10770",
  "thriller": "53",
  "guerre": "10752",
  "western": "37"
}


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

function filtersChange() {
  displayedMovies = [];
  container.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    loadMovie();
  }
}

function loadMovie() {
  const data = getRandomMovie().then(data => {
    if (data && !displayedMovies.includes(data.id)) {
      const movie = document.createElement('a');
      movie.href = `./movie/${data.id}`;

      let heures = Math.floor(data.time / 60);
      let minutesRestantes = data.time % 60;
      let heuresFormatées = ('0' + heures).slice(-2);
      let minutesFormatées = ('0' + minutesRestantes).slice(-2);

      movie.innerHTML = `
        <div class="poster">
          <img src="https://image.tmdb.org/t/p/w500/${data.imageUrl}" alt="${data.title}">
          <p>${heuresFormatées + ':' + minutesFormatées}:00</p>
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
    
    if (filters === "all") {
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}`;
    } else {
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}&with_genres=${correspondances[filters]}`;
    }
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
      id: randomMovie.id,
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
  if (window.innerWidth > 768) {
    document.querySelector('.menu-mobile').classList.remove('visible');
  }
});

document.querySelectorAll('.menu-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.menu-mobile').classList.toggle('visible');
  });
});

document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.' + filters).classList.remove('active');
    filters = button.classList.item(0);
    button.classList.add('active');
    console.log(filters);
    filtersChange();
  });
});


// Initial load
loadMovies();
