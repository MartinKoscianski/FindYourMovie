// Elements
const container = document.querySelector('.movies-container');

// API key
const apiKey = "86a1d264aff49d58b5d19eac7b08daa0";

// Variables
let isLoading = false;
let displayedMovies = [];
let filters = "all";
let crash = 0;
let search_mode = false;

const correspondances = {
  "action": 28,
  "aventure": 12,
  "animation": 16,
  "comedie": 35,
  "crime": 80,
  "documentaire": 99,
  "drame": 18,
  "famille": 10751,
  "fantastique": 14,
  "histoire": 36,
  "horreur": 27,
  "musique": 10402,
  "mystere": 9648,
  "romance": 10749,
  "science-fiction": 878,
  "telefilm": 10770,
  "thriller": 53,
  "guerre": 10752,
  "western": 37
}


// Functions
function resizePosters() {
  const posters = document.querySelectorAll('.poster img');
  posters.forEach(poster => {
    poster.style.height = poster.offsetWidth * 1.5 + 'px';
  });
}

function loadMovies() {
  isLoading = true;
  for (let i = 0; i < 24; i++) {
    loadMovie();
  }
  isLoading = false;
}

function loadMore() {
  if (isLoading) return;
  isLoading = true;
  crash = 0;
  for (let i = 0; i < 24; i++) {
    loadMovie();
  }
  isLoading = false;
}

function filtersChange() {
  isLoading = true;
  displayedMovies = [];
  container.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    loadMovie();
  }
  isLoading = false;
}

function refresh() {
  container.innerHTML = "";
  const loader = document.querySelector('.loader');
  loader.style.display = 'flex';
  displayedMovies.map(movie => {
    loadMovies(movie);
  });
  search_mode = false;
}

function loadMovie(id=false) {
  const data = getRandomMovie(id).then(data => {
    if (data && !displayedMovies.includes(data.id)) {
      const movie = document.createElement('a');
      movie.href = `./movie?id=${data.id}`;

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
      crash += 1;
      if (crash > 100) {
        console.log('Erreur lors du chargement des films. Veuillez réessayer.');
        isLoading = true;
        return;
      }
      loadMovie();
    }
  });
}

async function getRandomMovie(id) {
  try {
    let movieDetails;
    let credits;
    if(id === false) {
      let randomPage;
      let url;
      if( filters === "all") {
        randomPage = Math.floor(Math.random() * 500) + 1;
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}`;
      }
      
      if (filters !== "all") {
        randomPage = Math.floor(Math.random() * 300) + 1;
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}&with_genres=${correspondances[filters]}`;
      }
      const response = await axios.get(url);
      const randomMovie = response.data.results[Math.floor(Math.random() * 20)];

      movieDetails = await axios.get(`https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${apiKey}&language=fr-FR`);
      credits = await axios.get(`https://api.themoviedb.org/3/movie/${randomMovie.id}/credits?api_key=${apiKey}`);
    } else {
      movieDetails = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr-FR`);
      credits = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`);
    }


    if (!movieDetails.data.poster_path || movieDetails.data.title === movieDetails.data.original_title || movieDetails.data.adult || movieDetails.data.runtime < 60) {
      return getRandomMovie(id);
    }

    let director = 'Réaliseur inconnu';
    for (let i = 0; i < credits.data.crew.length; i++) {
      if (credits.data.crew[i].job === 'Director') {
        director = credits.data.crew[i].name;
        break;
      }
    }

    return {
      id: movieDetails.data.id,
      title: movieDetails.data.title,
      releaseDate: movieDetails.data.release_date,
      imageUrl: movieDetails.data.poster_path,
      time: movieDetails.data.runtime,
      director: director
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function searchInDB(text) {
  crash = 0;
  container.innerHTML = "";
  try {
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(text)}&page=1&include_adult=false`).then(response => {
    console.log(response.data.results);  
    if(response.data.results.length === 0) {
        const noResult = document.createElement('div');
        noResult.classList.add('no-result');
        noResult.innerHTML = `
          <h1>Aucun résultat trouvé</h1>
        `;
        container.appendChild(noResult);
      } else {
        response.data.results.map(movie => {
          loadMovie(movie.id);
        });
      }
    }).catch(error => {
      console.error(error);
    });
  } catch (error) {
    console.error(error);
  }
}

// Events
window.addEventListener('scroll', () => {
  if (isLoading || search_mode) return;
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
    if(search_mode) return;
    document.querySelector('.' + filters).classList.remove('active');
    filters = button.classList.item(0);
    button.classList.add('active');
    filtersChange();
  });
});

document.querySelector('.search input').addEventListener('input', (e) => {
  const search = e.target.value;
  if(search === "") {
    if(search_mode) {
      refresh();
    }
  } else {
    if(!search_mode) {
      search_mode = true;
      container.innerHTML = "";
      const loader = document.querySelector('.loader');
      loader.style.display = 'none';

      searchInDB(search);
    } else {
      searchInDB(search);
    }
  }
});


// Initial load
loadMovies();
