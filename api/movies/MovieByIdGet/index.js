const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { id } = req.params;

        // Error checking - verify that an id is received
        if (!id) {
            return res.status(400).json({ error: 'No id provided' });
        }

        // Find movie with matching _id using MovieModel
        const movie = await MovieModel.findById(id).lean();

        // If movie not found, return 404
        if (!movie) {
            return res.status(404).json({ error: 'No movie found' });
        }

        // Remove _id from each character
        if (movie.characters && Array.isArray(movie.characters)) {
            movie.characters = movie.characters.map(({ _id, ...character }) => character);
        }

        // Return the movie object (not array)
        return res.status(200).json(movie);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});