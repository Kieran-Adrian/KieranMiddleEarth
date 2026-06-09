const NamesById = require('./index');

describe('NamesById', () => {
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
        req.params = { characterName: 'Aragorn' };

        await NamesById({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie id provided' });
    });

    test('returns 400 when no character name is provided', async () => {
        req.params = { movieId: '69efd1c1b2f8c7327f029faf' };

        await NamesById({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No character name provided' });
    });

    test('returns 404 when movie is not found', async () => {
        req.params = { movieId: 'nonexistentid', characterName: 'Aragorn' };
        MovieModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
        });

        await NamesById({ MovieModel }, req, res);

        expect(MovieModel.findById).toHaveBeenCalledWith('nonexistentid');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie found' });
    });

    test('returns 404 when character is not found in movie', async () => {
        const mockMovie = {
            _id: '69efd1c1b2f8c7327f029faf',
            title: 'The Lord of the Rings: The Return of the King',
            characters: [
                { name: 'Frodo Baggins', race: 'Hobbit' }
            ]
        };
        req.params = { movieId: '69efd1c1b2f8c7327f029faf', characterName: 'Aragorn' };
        MovieModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMovie)
        });

        await NamesById({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No character found' });
    });

    test('returns object with movie, name and race when found', async () => {
        const mockMovie = {
            _id: '69efd1c1b2f8c7327f029faf',
            title: 'The Lord of the Rings: The Return of the King',
            characters: [
                { name: 'Frodo Baggins', race: 'Hobbit' },
                { name: 'Aragorn', race: 'Man' }
            ]
        };
        req.params = { movieId: '69efd1c1b2f8c7327f029faf', characterName: 'aragorn' };
        MovieModel.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMovie)
        });

        await NamesById({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            movie: 'The Lord of the Rings: The Return of the King',
            name: 'Aragorn',
            race: 'Man'
        });
    });

    test('returns 500 on internal error', async () => {
        req.params = { movieId: '69efd1c1b2f8c7327f029faf', characterName: 'Aragorn' };
        MovieModel.findById.mockImplementation(() => {
            throw new Error('Database error');
        });

        await NamesById({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});