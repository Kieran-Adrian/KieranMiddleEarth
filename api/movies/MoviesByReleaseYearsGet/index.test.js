const MoviesByReleaseYearsGet = require('./index');

describe('MoviesByReleaseYearsGet', () => {
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

    test('returns 406 when starting release year is not a number', async () => {
        req.params = { startReleaseYear: 'abc', endReleaseYear: '2005' };

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Starting release year must be a number' });
    });

    test('returns 406 when starting release year is less than 2000', async () => {
        req.params = { startReleaseYear: '1999', endReleaseYear: '2005' };

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Starting release year must be between 2000 and 2020' });
    });

    test('returns 406 when starting release year is greater than 2020', async () => {
        req.params = { startReleaseYear: '2021', endReleaseYear: '2005' };

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Starting release year must be between 2000 and 2020' });
    });

    test('returns 406 when ending release year is not a number', async () => {
        req.params = { startReleaseYear: '2000', endReleaseYear: 'xyz' };

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ending release year must be a number' });
    });

    test('returns 406 when ending release year is less than 2000', async () => {
        req.params = { startReleaseYear: '2000', endReleaseYear: '1999' };

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ending release year must be between 1977 and 2020' });
    });

    test('returns 406 when ending release year is greater than 2020', async () => {
        req.params = { startReleaseYear: '2000', endReleaseYear: '2021' };

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ending release year must be between 1977 and 2020' });
    });

    test('returns 404 when no movies are found', async () => {
        req.params = { startReleaseYear: '2000', endReleaseYear: '2005' };
        MovieModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
        });

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movies found' });
    });

    test('returns array of movies when found', async () => {
        const mockMovies = [
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fad' },
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                releaseYear: 2001,
                characters: [
                    { _id: 'charid1', name: 'Frodo Baggins', race: 'Hobbit' }
                ]
            }
        ];
        req.params = { startReleaseYear: '2000', endReleaseYear: '2005' };
        MovieModel.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockMovies)
        });

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(MovieModel.find).toHaveBeenCalledWith({
            releaseYear: { $gte: 2000, $lte: 2005 }
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            {
                _id: { $oid: '69efd1c1b2f8c7327f029fad' },
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                releaseYear: 2001,
                characters: [
                    { name: 'Frodo Baggins', race: 'Hobbit' }
                ]
            }
        ]);
    });

    test('returns 500 on internal error', async () => {
        req.params = { startReleaseYear: '2000', endReleaseYear: '2005' };
        MovieModel.find.mockImplementation(() => {
            throw new Error('Database error');
        });

        await MoviesByReleaseYearsGet({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});