const data = require('./data.json');
const { Pool } = require('pg');

const config = {
    database: 'animefv',
    host: 'localhost',
    user: 'postgres',
    password: 'postgres'
}

const pool = new Pool(
    config,
    {
        ssl: {
            rejectUnauthorized: false,
        }
    },
);

pool.on('error', (err, client) => {
    console.error(
        'Pool: Error inesperado por inactividad del cliente.', err, client);
    process.exit(-1);
});

pool.on('connect', function (client) {
    console.log('cliente conectado');
})

function increment(list) {
    let id = 1;

    if (list.length > 0) {
        if (!list[list.length - 1].id)
            list[list.length - 1].id = id;
        else
            id += list[list.length - 1].id;
    }

    this.id = id;
    list.push(this);
    return this;

}

const categories = function (props) {
    const { name } = props;
    this.id = undefined;
    this.name = name;
    this.proptotype
};

const animes = function (props) {
    const { title, description, image, uri } = props;
    this.id = undefined;
    this.title = title;
    this.description = description;
    this.image = image;
    this.uri = uri;
};

const categories_has_animes = function (props) {
    const { id_anime, id_categoria } = props;
    this.id = undefined;
    this.id_anime = id_anime;
    this.id_categoria = id_categoria;
};


let animesQueue = [];
let categoriesQueue = [];
let categoriesHasAnimesQueue = [];
const threads = 20;
let step = threads;

const categoriesMap = new Map();


function categoriesInMap(categoryMap) {

    if (categoriesMap.has(categoryMap)) return categoriesMap.get(categoryMap);
    const newCategory = new categories({ name: categoryMap }).increment(categoriesQueue);
    categoriesMap.set(categoryMap, newCategory);
    return newCategory;

}

function categoriesInAnime(id_categoria, id_anime) {
    return new categories_has_animes({ id_categoria, id_anime })
        .increment(categoriesHasAnimesQueue);
}

const unique = new Map();

async function save() {
    const tableName = this.constructor.name;
    const entries = Object.entries(this);
    let insert = `INSERT INTO ${tableName}`;

    let columns = [];
    let values = [];

    for (let [key, value] of entries) {
        columns.push(key);
        values.push(value);
    }

    if (unique.has(`${this.id}|${tableName}`)) {
        return true;
    }
    insert += `(${columns.join(',')}) `;
    insert += `VALUES (${values.map((_, index) => `$${(index + 1)}`)})`;
    await pool.query(insert, values);
    unique.set(`${this.id}|${tableName}`);
    return true;
}


Object.prototype.increment = increment;
Object.prototype.save = save;

(async function () {

    const totalAnimes = data.length;

    for (let steps = 0; steps <= totalAnimes; steps += threads) {

        const portionOfData = data.slice(steps, step)

        for (const portion of portionOfData) {

            const animeDetail = new animes(portion).increment(animesQueue);
            const categoriesMap = portion.categories.map(categoriesInMap);
            const categoriesHasAnimes = categoriesMap
                .map((categoriesInMap) => categoriesInAnime(categoriesInMap.id, animeDetail.id));

            await animeDetail.save();
            await Promise.all(categoriesQueue.map(categoryQueue => categoryQueue.save()));
            await Promise.all(categoriesHasAnimes.map(categoryHasAnime => categoryHasAnime.save()));

        }

        categoriesQueue = [];
        categoriesHasAnimesQueue = [];

        console.log({ remain: totalAnimes - step, total: totalAnimes, threads })
        step += threads;
    }

    await pool.end();
})();
