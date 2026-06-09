const CharactersByMovieId = require('./index');

describe('CharactersByMovieId', () => {
    let req, res, MovieModel;

    beforeEach(() => {
        req = { params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        MovieModel = {
            findById: jest.fn()
        };
    });

    test('returns 400 when no movie id is provided', async () => {
        req.params = {};

        await CharactersByMovieId({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie id provided' });
    });

    test('returns 404 when movie is not found', async () => {
        req.params = { movieId: 'nonexistentid' };
        MovieModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
        });

        await CharactersByMovieId({ MovieModel }, req, res);

        expect(MovieModel.findById).toHaveBeenCalledWith('nonexistentid');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie found' });
    });

    test('returns array of character names when movie is found', async () => {
        const mockMovie = {
            _id: '69efd1c1b2f8c7327f029fb0',
            title: 'The Hobbit: An Unexpected Journey',
            characters: [
                { name: 'Bilbo Baggins', race: 'Hobbit' },
                { name: 'Gandalf the Grey', race: 'Maia (Wizard)' },
                { name: 'Thorin Oakenshield', race: 'Dwarf' },
                { name: 'Balin', race: 'Dwarf' },
                { name: 'Radagast the Brown', race: 'Maia (Wizard)' },
                { name: 'Galadriel', race: 'Elf' }
            ]
        };
        req.params = { movieId: '69efd1c1b2f8c7327f029fb0' };
        MovieModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMovie)
        });

        await CharactersByMovieId({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            { name: 'Bilbo Baggins' },
            { name: 'Gandalf the Grey' },
            { name: 'Thorin Oakenshield' },
            { name: 'Balin' },
            { name: 'Radagast the Brown' },
            { name: 'Galadriel' }
        ]);
    });

    test('returns 500 on internal error', async () => {
        req.params = { movieId: '69efd1c1b2f8c7327f029fb0' };
        MovieModel.findById.mockImplementation(() => {
            throw new Error('Database error');
        });

        await CharactersByMovieId({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});