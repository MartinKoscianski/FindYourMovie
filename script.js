const apiKey = "86a1d264aff49d58b5d19eac7b08daa0";
const container = document.querySelector('.movies-container');
let isLoading = false;
let displayedMovies = [];

function loadMovie() {
  getRandomMovie().then(data => {
    if (data && !displayedMovies.includes(data.title)) {
      const movie = document.createElement('section');

      let heures = Math.floor(data.time / 60);
      let minutesRestantes = data.time % 60;
      let heuresFormatées = ('0' + heures).slice(-2);
      let minutesFormatées = ('0' + minutesRestantes).slice(-2);

      const popularity = (data.popularity/10).toFixed(1);
      if (popularity >= 7.5) {
        var color = 'green';
      } else if (popularity >= 4) {
        var color = 'orange';
      } else { 
        var color = 'red';
      }


      movie.innerHTML = `
        <div class="poster">
          <img src="https://image.tmdb.org/t/p/w500/${data.imageUrl}" alt="${data.title}">
          <p>${heuresFormatées + ':' + minutesFormatées}</p>
        </div>
        <div class="movie-infos">
          <h1>${data.title} <strong>(${data.releaseDate.substring(0, 4)})</strong></h1>
          <p>${data.director} • ${popularity}/10 <strong class="${color}">•</strong></p>
        </div>
      `;
      movie.classList.add('film');
      container.appendChild(movie);
      displayedMovies.push(data.title);
    } else {
      loadMovie();
    }
  });
}

async function getRandomMovie() {
  try {
    const randomPage = Math.floor(Math.random() * 500) + 1;
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr&include_adult=false&page=${randomPage}`;
    const response = await axios.get(url);
    const data = response.data;

    const randomIndex = Math.floor(Math.random() * data.results.length);
    const randomMovie = data.results[randomIndex];

    const id = randomMovie.id;
    const detailsUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr`;
    const detailsResponse = await axios.get(detailsUrl);
    const detailsData = detailsResponse.data;

    const urlCast = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=fr`;
    const castResponse = await axios.get(urlCast);

    const imageUrl = `https://image.tmdb.org/t/p/w500/${detailsData.poster_path}`;

    return {
      title: detailsData.title,
      imageUrl: imageUrl,
      time: detailsData.runtime,
      popularity: detailsData.popularity,
      releaseDate: detailsData.release_date,
      director: castResponse.data.crew.find(member => member.job === 'Director').name
    };

  } catch (error) {
    console.error("Erreur de requête :", error.message);
    return null;
  }
}

function loadMore() {
  isLoading = true;
  setTimeout(() => {
    for (let i = 0; i < 24; i++) {
      loadMovie();
    }
    isLoading = false;
  }, 2300);
}

window.addEventListener('scroll', () => {
  if (isLoading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
    loadMore();
  }
});

const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr&include_adult=false&page=1}`;
const response = await axios.get(url);
const data = response.data;
console.log(data);

// Initial load
for (let i = 0; i < 24; i++) {
  loadMovie();
}
