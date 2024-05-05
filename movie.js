// Elements
const container = document.querySelector('.movies-container');
const infos = document.querySelector('.info-container');

// API key
const apiKey = "86a1d264aff49d58b5d19eac7b08daa0";

// Variables
let displayedMovies = [];
let crash = 0;


// Functions
function loadMovie(id=false) {
    const data = getRandomMovie(id).then(data => {
      if (data && !displayedMovies.includes(data.id)) {
        const movie = document.createElement('a');
        movie.href = `./movie.html?id=${data.id}`;
  
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

async function loadSimilarMovies(id) {
    try {
      const similarMovies = await axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}&language=fr-FR&page=1`);
      console.log(similarMovies.data.results);
      similarMovies.data.results.map(movie => {
        loadMovie(movie.id);
      });
    } catch (error) {
      console.error(error);
    }
}

function resizePosters() {
    const posters = document.querySelectorAll('.poster img');
    posters.forEach(poster => {
      poster.style.height = poster.offsetWidth * 1.5 + 'px';
    });
  }


// Events
document.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelector('.menu-mobile').classList.toggle('visible');
    });
});

window.addEventListener('resize', () => {
    resizePosters();
    if (window.innerWidth > 768) {
      document.querySelector('.menu-mobile').classList.remove('visible');
    }
});


// Initial load
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
if (!id) {
    window.location.href = '/';
}

(async () => {
    const movie = await getRandomMovie(id);
    document.title = "FindYourMovie » " + movie.title;
    loadSimilarMovies(id);
})();
