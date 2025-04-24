import axios from "axios";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const API_Auth =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNTFiNzViNTlhOTI4ZmZjNGQwNzJhOTU5Mjc0NDJjOSIsIm5iZiI6MTcyOTE3NDI4My42NjIzMjgsInN1YiI6IjY2NTA0MWNkNDY2NzQ0MGY4OTM1MGM2MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.VUuTbZPtRaYLT8FN-wbCfESkfWdeezIs7cK1m8-DIPA";
const API_KEY = "e51b75b59a928ffc4d072a95927442c9";
const MOVIE_URL = "https://api.themoviedb.org/3/search/movie";
const TV_URL = "https://api.themoviedb.org/3/search/tv";
const SEARCH_MOVIE_URL = "https://api.themoviedb.org/3/movie";
const SEARCH_TV_URL = "https://api.themoviedb.org/3/tv";
const POPULAR_MOVIE_URL = "https://api.themoviedb.org/3/movie/popular";
const POPULAR_TV_URL = "https://api.themoviedb.org/3/tv/popular";
const MOVIES_TOP_URL = "https://api.themoviedb.org/3/movie/top_rated";
const TV_TOP_URL = "https://api.themoviedb.org/3/tv/top_rated";
const TRENDING_MOVIE = "https://api.themoviedb.org/3/trending/movie/day";
const TRENDING_TV = "https://api.themoviedb.org/3/trending/tv/day";

const config = {
  headers: { Authorization: `Bearer ${API_Auth}` },
};

app.get("/", async (req, res) => {
  let popularMovieList = [];
  try {
    const popularMovieResult = await axios.get(POPULAR_MOVIE_URL, config);
    const popularMovieResponse = JSON.stringify(popularMovieResult.data);
    const popularMovieParse = JSON.parse(popularMovieResponse);
    const movieResult = popularMovieParse.results;
    const popularMovies = movieResult;
    popularMovies.forEach((movie) => {
      let popularMovie = {
        title: movie.title,
        moviePoster: "https://image.tmdb.org/t/p/w500" + movie.poster_path,
        year: movie.release_date.slice(0, 4),
        id: movie.id,
      };
      popularMovieList.push(popularMovie);
    });

    let popularTvList = [];
    const popularTvResult = await axios.get(POPULAR_TV_URL, config);
    const popularTvResponse = JSON.stringify(popularTvResult.data);
    const popularTvParse = JSON.parse(popularTvResponse);
    const tvResult = popularTvParse.results;
    const popularTvs = tvResult;
    popularTvs.forEach((tv) => {
      let popularTV = {
        title: tv.name,
        tvPoster: "https://image.tmdb.org/t/p/w500" + tv.poster_path,
        year: tv.first_air_date.slice(0, 4),
        id: tv.id,
      };
      popularTvList.push(popularTV);
    });

    res.render("index.ejs", {
      topMovie: popularMovieList,
      topTv: popularTvList,
    });
  } catch (error) {
    res.status(500);
  }
});

app.post("/movie-search", async (req, res) => {
  const search = req.body.movieSearch;
  const movies = [];
  const config = {
    headers: { Authorization: `Bearer ${API_Auth}` },
    params: {
      api_key: API_KEY,
      query: search,
    },
  };
  try {
    const response = await axios.get(MOVIE_URL, config);
    const movieResult = JSON.stringify(response.data.results);
    const movieParse = JSON.parse(movieResult);
    movieParse.forEach((movie) => {
      let movieData = {
        title: movie.original_title,
        year: movie.release_date,
        id: movie.id,
      };
      movies.push(movieData);
    });

    res.render("moviesearch.ejs", { movies: movies });
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/tv-search", async (req, res) => {
  const search = req.body.tvSearch;
  const tvShows = [];
  const config = {
    headers: { Authorization: `Bearer ${API_Auth}` },
    params: {
      api_key: API_KEY,
      query: search,
    },
  };
  try {
    const response = await axios.get(TV_URL, config);
    const tvResult = JSON.stringify(response.data.results);
    const tvParse = JSON.parse(tvResult);
    tvParse.forEach((tv) => {
      let tvData = {
        title: tv.original_name,
        year: tv.first_air_date,
        id: tv.id,
      };
      tvShows.push(tvData);
    });

    res.render("tvsearch.ejs", { tvshow: tvShows });
  } catch (error) {
    res.status(500);
  }
});

app.get("/movie/:id", async (req, res) => {
  const movieID = req.params.id;
  try {
    const response = await axios.get(`${SEARCH_MOVIE_URL}/${movieID}`, config);
    const result = JSON.stringify(response.data);
    const resultParse = JSON.parse(result);
    const movieResult = {
      imgUrl: "https://image.tmdb.org/t/p/w500" + resultParse.backdrop_path,
      title: resultParse.title,
      year: resultParse.release_date.split("-")[0],
      description: resultParse.overview,
      genre: resultParse.genres[0].name,
      popularity: Math.round(resultParse.popularity * 100) / 100,
      runtime: resultParse.runtime + " minutes",
    };
    res.render("movie.ejs", { movie: movieResult });
  } catch (error) {
    res.status(500);
  }
});

app.get("/tv/:id", async (req, res) => {
  const tvID = req.params.id;
  try {
    const response = await axios.get(`${SEARCH_TV_URL}/${tvID}`, config);
    const result = JSON.stringify(response.data);
    const resultParse = JSON.parse(result);
    const tvResult = {
      imgUrl: "https://image.tmdb.org/t/p/w500" + resultParse.backdrop_path,
      title: resultParse.name,
      year: resultParse.first_air_date.split("-")[0],
      description: resultParse.overview,
      genre: resultParse.genres[0].name,
      popularity: Math.round(resultParse.popularity * 100) / 100,
      noOfSeasons: resultParse.number_of_seasons,
      noOfEpisodes: resultParse.number_of_episodes,
    };
    res.render("tv.ejs", { tv: tvResult });
  } catch (error) {
    res.status(500);
  }
});

app.get("/movies", async (req, res) => {
  let topMovies = [];
  let trendingMovieList = [];
  try {
    const response = await axios.get(MOVIES_TOP_URL, config);
    const result = JSON.stringify(response.data);
    const resultParse = JSON.parse(result);
    const topRatedMovies = resultParse.results;
    topRatedMovies.forEach((movie) => {
      let topMovie = {
        title: movie.title,
        poster: "https://image.tmdb.org/t/p/w500" + movie.poster_path,
        year: movie.release_date.slice(0, 4),
        id: movie.id,
      };
      topMovies.push(topMovie);
    });

    const response2 = await axios.get(TRENDING_MOVIE, config);
    const result2 = JSON.stringify(response2.data);
    const resultParse2 = JSON.parse(result2);
    const trendingMovies = resultParse2.results;
    trendingMovies.forEach((movie) => {
      let trendMovie = {
        title: movie.title,
        poster: "https://image.tmdb.org/t/p/w500" + movie.poster_path,
        year: movie.release_date.slice(0, 4),
        id: movie.id,
      };
      trendingMovieList.push(trendMovie);
    });

    res.render("movies.ejs", { movies: topMovies, trend: trendingMovieList });
  } catch (error) {
    res.status(500);
  }
});

app.get("/tvshows", async (req, res) => {
  let topTvList = [];
  let trendingTvList = [];
  const response = await axios.get(TV_TOP_URL, config);
  const result = JSON.stringify(response.data);
  const resultParse = JSON.parse(result);
  const topTvShows = resultParse.results;
  topTvShows.forEach((tv) => {
    let topTV = {
      title: tv.name,
      poster: "https://image.tmdb.org/t/p/w500" + tv.poster_path,
      year: tv.first_air_date.slice(0, 4),
      id: tv.id,
    };
    topTvList.push(topTV);
  });

  const response2 = await axios.get(TRENDING_TV, config);
  const result2 = JSON.stringify(response2.data);
  const resultParse2 = JSON.parse(result2);
  const trendingTvShows = resultParse2.results;
  trendingTvShows.forEach((tv) => {
    let trendingTV = {
      title: tv.name,
      poster: "https://image.tmdb.org/t/p/w500" + tv.poster_path,
      year: tv.first_air_date.slice(0, 4),
      id: tv.id,
    };
    trendingTvList.push(trendingTV);
  });

  res.render("tvshows.ejs", { tvshows: topTvList, trend: trendingTvList });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
