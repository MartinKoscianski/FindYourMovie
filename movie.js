// Elements
const container = document.querySelector('.movies-container');
const infos = document.querySelector('.info-container');

// API key
const apiKey = "86a1d264aff49d58b5d19eac7b08daa0";

// Variables
let crash = 0;


// Functions
function loadMovie(id) {
  getRandomMovie(id).then(data => {
    if (data) {
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

      resizePosters();
    } else {
      crash += 1;
      if (crash > 100) {
        console.log('Erreur lors du chargement des films. Veuillez réessayer.');
        isLoading = true;
        return;
      }
    }
  });
}

async function getRandomMovie(id) {
  try {
    let movieDetails;
    let credits;
    movieDetails = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr-FR`);
    credits = await axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`);

    if (!movieDetails.data.poster_path || movieDetails.data.title === movieDetails.data.original_title || movieDetails.data.adult || movieDetails.data.runtime < 60) {
      return null;
    }

    let director = 'Réaliseur inconnu';
    for (let i = 0; i < credits.data.crew.length; i++) {
      if (credits.data.crew[i].job === 'Director') {
        director = credits.data.crew[i].name;
        break;
      }
    }

    let trailer = null;
    try {
      const videos = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=fr-FR`);
      for (let i = 0; i < videos.data.results.length; i++) {
        if (videos.data.results[i].type === 'Trailer') {
          trailer = videos.data.results[i].key;
          break;
        }
      }
    } catch {}
    console.log(trailer);

    // ajouter trailer si diferent de null
    return {
      id: movieDetails.data.id,
      title: movieDetails.data.title,
      releaseDate: movieDetails.data.release_date,
      imageUrl: movieDetails.data.poster_path,
      time: movieDetails.data.runtime,
      director: director,
      genres: movieDetails.data.genres,
      trailer: trailer,
      sinopsis: movieDetails.data.overview
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loadSimilarMovies(id) {
    try {
      const similarMovies = await axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}&language=fr-FR&page=1`);
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

function resizeIframe() {
  const iframes = document.querySelectorAll('.trailer');
  iframes.forEach(iframe => {
    iframe.style.height = iframe.offsetWidth * 0.5 + 'px';
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
    resizeIframe();
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
    infos.innerHTML = `
    <div class='no-iframe'>
      <section class="i-poster">
        <img src="https://image.tmdb.org/t/p/w500/${movie.imageUrl}" alt="${movie.title}">
      </section>
      <div class="infos">
        <section class="title">
          <h1><strong>${movie.title}</strong> (${movie.releaseDate.substring(0, 4)})</h1>
        </section>
        <div class="infos-details">
          <section class="date-director">
            <p>${movie.releaseDate}  •  ${movie.director}</p>
          </section>
          <section class="time">
            <p>${Math.floor(movie.time / 60)}h${movie.time % 60}</p>
          </section>
          <section class="genres">
            <p>${movie.genres.map(genre => genre.name).join(' • ')}</p>
          </section>
        </div>
      </div>
    </div>
    `;
    if (movie.trailer) {
      document.querySelector('.infos').innerHTML += `
        <section class="trailer t-desk">
        
          <iframe src="https://www.youtube.com/embed/${movie.trailer}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </section>
      `;
      infos.innerHTML += `
        <section class="trailer t-mobile">
          <iframe  src="https://www.youtube.com/embed/${movie.trailer}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </section>
      `;
      resizeIframe();
    } else {
      // Add sinopsis
      document.querySelector('.infos').innerHTML += `
        <section class="sinopsis t-desk">
          <p>${movie.sinopsis}</p>
        </section>
        <section class="no-trailer t-desk">
          <p>Aucune bande-annonce disponible pour ce film.</p>
        </section>
      `;
      infos.innerHTML += `
        <section class="sinopsis t-mobile">
          <p>${movie.sinopsis}</p>
        </section>
        <section class="no-trailer t-mobile">
          <p>Aucune bande-annonce disponible pour ce film.</p>
        </section>
      `;
    }
})();
