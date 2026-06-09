const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
    try {
        const { movieName, releaseYear } = req.body;

        // Error checking - verify movie name is provided
        if (!movieName) {
            return res.status(406).json({ error: 'No movie name found' });
        }

        // Error checking - verify movie name is more than 3 characters
        if (movieName.length <= 3) {
            return res.status(406).json({ error: 'Invalid movie name' });
        }

        // Error checking - verify release year is a valid number between 1990 and current year
        const currentYear = new Date().getFullYear();
        const year = Number(releaseYear);
        if (isNaN(year) || year < 1990 || year > currentYear) {
            return res.status(406).json({ error: 'Invalid release year' });
        }

        // Create the new movie with no characters
        const newMovie = await MovieModel.create({
            title: movieName,
            releaseYear: year,
            characters: []
        });

        // Return the newly created movie
        return res.status(200).json(newMovie);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});