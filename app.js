const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject_2 = (dbObject_2) => {
  return {
    directorId: dbObject_2.director_id,
    directorName: dbObject_2.director_name,
  };
};

// API-1

app.get("/movies/", async (request, response) => {
  const getAllMovieNamesQuery = `
    SELECT movie_name FROM movie`;
  const movieNames = await database.all(getAllMovieNamesQuery);
  response.send(
    movieNames.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

// API-2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO
    movie(director_id,movie_name,lead_actor)
    VALUES
    (${directorId},'${movieName}','${leadActor}')`;
  const newMovie = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API-3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie
    WHERE movie_id =${movieId}`;
  const specificMovies = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(specificMovies));
});

// API-4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'

    WHERE movie_id = ${movieId}`;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API-5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API-6
app.get("/directors/", async (request, response) => {
  const getAllDirectorNamesQuery = `
    SELECT * FROM director`;
  const directorNames = await database.all(getAllDirectorNamesQuery);
  response.send(
    directorNames.map((eachDirector) =>
      convertDbObjectToResponseObject_2(eachDirector)
    )
  );
});

//API-7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllMovieQuery = `
    SELECT
     movie_name
      FROM
       movie
    WHERE director_id= '${directorId}';`;
  const directorMovies = await database.all(getAllMovieQuery);
  response.send(
    directorMovies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
