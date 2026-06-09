const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { movieId, characterName } = req.body;

        // Error checking - verify characterName is provided
        if (!characterName) {
            return res.status(404).json({ error: 'No Main Character Name Provided' });
        }

        // Error checking - verify characterName has at least 3 characters
        if (characterName.length < 3) {
            return res.status(406).json({ error: 'Character Name is not valid. It must be at least three characters.' });
        }

        // Find movie with matching _id
        const movie = await MovieModel.findById(movieId);

        // If movie not found, return 404
        if (!movie) {
            return res.status(404).json({ error: 'No movie found' });
        }

        // Add the new character
        movie.characters.push({ name: characterName });
        await movie.save();

        // Return the updated movie
        return res.status(200).json(movie);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});