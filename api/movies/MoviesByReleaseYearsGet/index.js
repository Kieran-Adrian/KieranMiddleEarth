const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { startReleaseYear, endReleaseYear } = req.params;

        // Validate starting release year is a number
        const startYear = Number(startReleaseYear);
        if (isNaN(startYear)) {
            return res.status(406).json({ error: 'Starting release year must be a number' });
        }

        // Validate starting release year range
        if (startYear < 2000 || startYear > 2020) {
            return res.status(406).json({ error: 'Starting release year must be between 2000 and 2020' });
        }

        // Validate ending release year is a number
        const endYear = Number(endReleaseYear);
        if (isNaN(endYear)) {
            return res.status(406).json({ error: 'Ending release year must be a number' });
        }

        // Validate ending release year range
        if (endYear < 2000 || endYear > 2020) {
            return res.status(406).json({ error: 'Ending release year must be between 1977 and 2020' });
        }

        // Find movies between starting and ending release year
        const movies = await MovieModel.find({
            releaseYear: { $gte: startYear, $lte: endYear }
        }).lean();

        // If no movies found, return 404
        if (!movies || movies.length === 0) {
            return res.status(404).json({ error: 'No movies found' });
        }

        // Remove _id from each character in each movie
        const cleanedMovies = movies.map(movie => {
            if (movie.characters && Array.isArray(movie.characters)) {
                movie.characters = movie.characters.map(({ _id, ...character }) => character);
            }
            return movie;
        });

        // Return the array of movies
        return res.status(200).json(cleanedMovies);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});