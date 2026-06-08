const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { race } = req.params;

        // Error checking - verify that a race is received
        if (!race) {
            return res.status(400).json({ error: 'No race provided' });
        }

        // Case-insensitive regex for matching race
        const raceRegex = new RegExp(`^${race}$`, 'i');

        // Find movies that contain at least one character with the matching race
        const movies = await MovieModel.find(
            { 'characters.race': raceRegex },
            { _id: 1, title: 1, releaseYear: 1, characters: 1 }
        ).lean();

        // If no movies found, return 404
        if (!movies || movies.length === 0) {
            return res.status(404).json({ error: `No movie(s) with characters of the ${race} race were found` });
        }

        // Filter characters in each movie to only include those matching the race
        const filteredMovies = movies.map(movie => {
            const filteredCharacters = movie.characters
                .filter(character => raceRegex.test(character.race))
                .map(({ _id, ...character }) => character);
            return {
                _id: movie._id,
                title: movie.title,
                releaseYear: movie.releaseYear,
                characters: filteredCharacters
            };
        });

        // Return the array of movies with filtered characters
        return res.status(200).json(filteredMovies);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});