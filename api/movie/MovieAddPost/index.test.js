const MovieAddPost = require('./index');

describe('MovieAddPost', () => {
    let req, res, MovieModel;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        MovieModel = {
            create: jest.fn()
        };
    });

    test('returns 406 when movie name is not provided', async () => {
        req.body = { releaseYear: 2024 };

        await MovieAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie name found' });
    });

    test('returns 406 when movie name has three characters or less', async () => {
        req.body = { movieName: 'abc', releaseYear: 2024 };

        await MovieAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid movie name' });
    });

    test('returns 406 when release year is not a number', async () => {
        req.body = { movieName: 'Valid Movie Name', releaseYear: 'abc' };

        await MovieAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid release year' });
    });

    test('returns 406 when release year is less than 1990', async () => {
        req.body = { movieName: 'Valid Movie Name', releaseYear: 1989 };

        await MovieAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid release year' });
    });

    test('returns 406 when release year is greater than current year', async () => {
        const futureYear = new Date().getFullYear() + 1;
        req.body = { movieName: 'Valid Movie Name', releaseYear: futureYear };

        await MovieAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid release year' });
    });

    test('returns 200 and the new movie when valid data is provided', async () => {
        const mockMovie = {
            _id: { $oid: '690b9436fb29d9d76b2a0dc2' },
            name: 'The Lord of the Rings: The War of the Rohirrim',
            releaseYear: 2024,
            characters: []
        };
        req.body = {
            movieName: 'The Lord of the Rings: The War of the Rohirrim',
            releaseYear: 2024
        };
        MovieModel.create.mockResolvedValue(mockMovie);

        await MovieAddPost({ MovieModel }, req, res);

        expect(MovieModel.create).toHaveBeenCalledWith({
            name: 'The Lord of the Rings: The War of the Rohirrim',
            releaseYear: 2024,
            characters: []
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMovie);
    });

    test('returns 500 on internal error', async () => {
        req.body = {
            movieName: 'The Lord of the Rings: The War of the Rohirrim',
            releaseYear: 2024
        };
        MovieModel.create.mockRejectedValue(new Error('Database error'));

        await MovieAddPost({ MovieModel }, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});