const MoviesByRaceGet = require('./index');

describe('MoviesByRaceGet', () => {
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

    test('returns 400 when no race is provided', async () => {
        req.params = {};

        await MoviesByRaceGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No race provided' });
    });

    test('returns 404 when no movies are found with the race', async () => {
        req.params = { race: 'oompa loompa' };
        MovieModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
        });

        await MoviesByRaceGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie(s) with characters of the oompa loompa race were found' });
    });

    test('returns array of movies with filtered characters when found', async () => {
        const mockMovies = [
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fad' },
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                releaseYear: 2001,
                characters: [
                    { _id: 'charid1', name: 'Frodo Baggins', race: 'Hobbit' },
                    { _id: 'charid2', name: 'Gimli', race: 'Dwarf' }
                ]
            },
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fb0' },
                title: 'The Hobbit: An Unexpected Journey',
                releaseYear: 2012,
                characters: [
                    { _id: 'charid3', name: 'Thorin Oakenshield', race: 'Dwarf' },
                    { _id: 'charid4', name: 'Balin', race: 'Dwarf' },
                    { _id: 'charid5', name: 'Bilbo Baggins', race: 'Hobbit' }
                ]
            }
        ];
        req.params = { race: 'dwarf' };
        MovieModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMovies)
        });

        await MoviesByRaceGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fad' },
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                releaseYear: 2001,
                characters: [
                    { name: 'Gimli', race: 'Dwarf' }
                ]
            },
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fb0' },
                title: 'The Hobbit: An Unexpected Journey',
                releaseYear: 2012,
                characters: [
                    { name: 'Thorin Oakenshield', race: 'Dwarf' },
                    { name: 'Balin', race: 'Dwarf' }
                ]
            }
        ]);
    });

    test('returns 500 on internal error', async () => {
        req.params = { race: 'dwarf' };
        MovieModel.find.mockImplementation(() => {
            throw new Error('Database error');
        });

        await MoviesByRaceGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});