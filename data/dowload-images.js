const axios = require('axios').default;
const axiosRetry = require('axios-retry');
axiosRetry(axios, { retries: 15 });
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

const { writeFileSync, existsSync } = require('fs');
const animes = require('./store.json');

async function dowloadImage(anime) {
    const { image } = anime;
    let imageName = image.split('/');
    imageName = imageName[imageName.length - 1];
    imageName = `./data/images/${imageName}`;

    if (!existsSync(imageName)) {
        const response = await axios.get(image, { responseType: 'arraybuffer' });
        writeFileSync(imageName, Buffer.from(response.data, 'base64'), 'base64');
        return true;
    }

    return false;
}

(
    async function () {

        const total = animes.length;
        const threads = 20;
        let steps = threads;

        for (let step = 0; step < total; step += threads) {
            await Promise.all(animes.slice(step, steps).map(dowloadImage));
            const remaining = animes.slice(step).length;
            steps += threads;
            console.log({ threads, remaining })
        }

    }
)();