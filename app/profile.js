const moment = require('moment');
const Result = require('../models/Result');

function getResults(req, res, next, books){
    Result.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: { book: '$book', day: '$day' }, count: { $sum: 1 }, ids: { $push: '$_id' } } },
        { $group: { _id: '$_id.book', days: { $push: { day: '$_id.day', count: '$count', ids: '$ids' } } } }
    ], (err, results) => {
        if(err) return next(err);

        let r = {};
        books.forEach(book => r[book.id] = []);
        results.forEach(result => {
            r[result._id].push(...result.days);
            r[result._id].sort((a, b) => a.day - b.day);
            r[result._id].forEach(day => day.dates = day.ids.map(id => moment(id.getTimestamp()).format('YYYY-MM-DD HH:mm:ss')).sort());
        });

        res.locals.results = r;
        next();
    });
}

module.exports = {
    getResults
};
