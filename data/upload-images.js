const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const storage = require('./store.json');;

const axiosRetry = require('axios-retry');
axiosRetry(axios, { retries: 15 });
axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

async function uploadFile(image) {

    const formData = new FormData();
    formData.append('file', fs.createReadStream('./data/images/' + image));
    formData.append('folder', 'anime-flv');

    const config = {
        method: 'post',
        url: 'http://localhost:3500/load',
        headers: {
            'api-key': process.env.api_key,
            ...formData.getHeaders()
        },
        data: formData
    }

    return (await axios(config)).data;
}

(async function () {
    let data = [];

    const thread = 20;
    let steps = thread;
    const total = storage.length;

    for (let step = 0; step < total; step += thread) {

        await Promise.all(
            storage.slice(step, steps)
                .map(async anime => {
                    let { image } = anime;
                    image = image.split('/');
                    image = image[image.length - 1];
                    const { cdn } = await uploadFile(image);
                    anime.image = cdn;
                    data.push(anime);
                    return true;
                })
        );
        steps += thread;
        const remaining = storage.slice(steps).length;
        const uploaded = total - remaining;
        console.log({ remaining, total, uploaded });
    }

    fs.writeFileSync('data.json', JSON.stringify(data));

})();