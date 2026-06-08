const fs = require('fs');
const path = require('path');
const MovieByIdGet = require('./index');

jest.mock('fs');

describe('MovieByIdGet', () => {
    let req;
    let res;
    const mockMovies = [
        {
            _id: '69efd1c1b2f8c7327f029faf',
            title: 'The Fellowship of the Ring',
            year: 2001
        },
        {
            _id: '79efd1c1b2f8c7327f029fb0',
            title: 'The Two Towers',
            year: 2002
        }
    ];

    beforeEach(() => {
        req = {
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify(mockMovies));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return movie object when valid id is provided', () => {
        req.params.id = '69efd1c1b2f8c7327f029faf';

        MovieByIdGet(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMovies[0]);
    });

    test('should return 400 error when no id is provided', () => {
        MovieByIdGet(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No id provided' });
    });

    test('should return 404 error when movie is not found', () => {
        req.params.id = 'nonexistentid123';

        MovieByIdGet(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'No movie found' });
    });

    test('should return 500 error when file read fails', () => {
        req.params.id = '69efd1c1b2f8c7327f029faf';
        fs.readFileSync = jest.fn().mockImplementation(() => {
            throw new Error('File read error');
        });

        MovieByIdGet(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('should return movie as object not array', () => {
        req.params.id = '69efd1c1b2f8c7327f029faf';

        MovieByIdGet(req, res);

        const calledWith = res.json.mock.calls[0][0];
        expect(Array.isArray(calledWith)).toBe(false);
        expect(typeof calledWith).toBe('object');
    });
});