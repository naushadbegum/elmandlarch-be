const knex = require('knex')({
    client: 'mysql',
    connection: {
        user: 'admin',
        password: 'flower2307',
        database: 'elmandlarch'
    }
})
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf;