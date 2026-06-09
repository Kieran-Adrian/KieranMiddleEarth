const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { movieId, characterName } = req.params;

        // Error checking - verify that movieId is received
        if (!movieId) {
            return res.status(400).json({ error: 'No movie id provided' });
        }

        // Error checking - verify that characterName is received
        if (!characterName) {
            return res.status(400).json({ error: 'No character name provided' });
        }

        // Find movie with matching _id
        const movie = await MovieModel.findById(movieId).lean();

        // If movie not found, return 404
        if (!movie) {
            return res.status(404).json({ error: 'No movie found' });
        }

        // Case-insensitive search for character name
        const characterRegex = new RegExp(`^${characterName}$`, 'i');
        const character = movie.characters.find(c => characterRegex.test(c.name));

        // If character not found, return 404
        if (!character) {
            return res.status(404).json({ error: 'No character found' });
        }

        // Return the object with movie, name and race
        return res.status(200).json({
            movie: movie.title,
            name: character.name,
            race: character.race
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});