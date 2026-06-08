const MoviesByCharacterNameGet = require('./index');

describe('MoviesByCharacterNameGet', () => {
    let req, res, MovieModel;

    beforeEach(() => {
        req = { params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        MovieModel = {
            find: jest.fn()
        };
    });

    test('returns 400 when no character name is provided', async () => {
        req.params = {};

        await MoviesByCharacterNameGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No character name provided' });
    });

    test('returns 404 when no movies are found with the character', async () => {
        req.params = { characterName: 'Nonexistent Character' };
        MovieModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
        });

        await MoviesByCharacterNameGet({ MovieModel }, req, res);

        expect(MovieModel.find).toHaveBeenCalledWith(
            { 'characters.name': 'Nonexistent Character' },
            { _id: 1, title: 1, releaseYear: 1 }
        );
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie(s) with this Character were found' });
    });

    test('returns array of movies when found', async () => {
        const mockMovies = [
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fad' },
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                releaseYear: 2001
            },
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fae' },
                title: 'The Lord of the Rings: The Two Towers',
                releaseYear: 2002
            },
            {
                _id: { $oid: '69efd1c1b2f8c7327f029faf' },
                title: 'The Lord of the Rings: The Return of the King',
                releaseYear: 2003
            }
        ];
        req.params = { characterName: 'Frodo Baggins' };
        MovieModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMovies)
        });

        await MoviesByCharacterNameGet({ MovieModel }, req, res);

        expect(MovieModel.find).toHaveBeenCalledWith(
            { 'characters.name': 'Frodo Baggins' },
            { _id: 1, title: 1, releaseYear: 1 }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMovies);
    });

    test('returns 500 on internal error', async () => {
        req.params = { characterName: 'Frodo Baggins' };
        MovieModel.find.mockImplementation(() => {
            throw new Error('Database error');
        });

        await MoviesByCharacterNameGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});