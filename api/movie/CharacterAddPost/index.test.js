const CharacterAddPost = require('./index');

describe('CharacterAddPost', () => {
    let req, res, MovieModel;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        MovieModel = {
            findById: jest.fn()
        };
    });

    test('returns 404 when no character name is provided', async () => {
        req.body = { movieId: '690b9436fb29d9d76b2a0dc2' };

        await CharacterAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No Main Character Name Provided' });
    });

    test('returns 406 when character name has less than 3 characters', async () => {
        req.body = { movieId: '690b9436fb29d9d76b2a0dc2', characterName: 'Hi' };

        await CharacterAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Character Name is not valid. It must be at least three characters.' });
    });

    test('returns 404 when movie is not found', async () => {
        req.body = { movieId: 'nonexistentid', characterName: 'Helm' };
        MovieModel.findById.mockResolvedValue(null);

        await CharacterAddPost({ MovieModel }, req, res);

        expect(MovieModel.findById).toHaveBeenCalledWith('nonexistentid');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie found' });
    });

    test('returns 200 and updated movie when character is added', async () => {
        const mockMovie = {
            _id: { $oid: '690b9436fb29d9d76b2a0dc2' },
            title: 'The Lord of the Rings: The War of the Rohirrim',
            releaseYear: 2024,
            characters: [],
            save: jest.fn().mockResolvedValue(true)
        };
        req.body = { movieId: '690b9436fb29d9d76b2a0dc2', characterName: 'Helm' };
        MovieModel.findById.mockResolvedValue(mockMovie);

        await CharacterAddPost({ MovieModel }, req, res);

        expect(mockMovie.characters).toContainEqual({ name: 'Helm' });
        expect(mockMovie.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMovie);
    });

    test('returns 500 on internal error', async () => {
        req.body = { movieId: '690b9436fb29d9d76b2a0dc2', characterName: 'Helm' };
        MovieModel.findById.mockRejectedValue(new Error('Database error'));

        await CharacterAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});