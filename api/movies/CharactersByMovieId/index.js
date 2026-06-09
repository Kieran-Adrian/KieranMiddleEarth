const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { movieId } = req.params;

        // Error checking - verify that movieId is received
        if (!movieId) {
            return res.status(400).json({ error: 'No movie id provided' });
        }

        // Find movie with matching _id
        const movie = await MovieModel.findById(movieId).lean();

        // If movie not found, return 404
        if (!movie) {
            return res.status(404).json({ error: 'No movie found' });
        }

        // Map characters to only include the name
        const characters = movie.characters.map(character => ({
            name: character.name
        }));

        // Return the array of character names
        return res.status(200).json(characters);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});