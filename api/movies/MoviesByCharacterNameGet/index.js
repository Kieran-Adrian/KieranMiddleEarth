const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { characterName } = req.params;

        // Error checking - verify that a character name is received
        if (!characterName) {
            return res.status(400).json({ error: 'No character name provided' });
        }

        // Find movies that contain a character with the matching name
        const movies = await MovieModel.find(
            { 'characters.name': characterName },
            { _id: 1, title: 1, releaseYear: 1 }
        ).lean();

        // If no movies found, return 404
        if (!movies || movies.length === 0) {
            return res.status(404).json({ error: 'No movie(s) with this Character were found' });
        }

        // Return the array of movies
        return res.status(200).json(movies);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});