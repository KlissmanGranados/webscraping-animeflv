function parserObject(htmlDocument) {
    const titles = [...htmlDocument.querySelectorAll(".ListAnimes li article a .Title")];
    const descriptions = htmlDocument.querySelectorAll(".ListAnimes .Description p:nth-child(3)");
    const images = htmlDocument.querySelectorAll(".ListAnimes img");
    const uris = htmlDocument.querySelectorAll('.ListAnimes li article .Description a');
    return titles.map((title, index) => {
        title = title.textContent;
        const description = descriptions[index].textContent;
        const image = images[index].src;
        const uri = uris[index].href;
        return { title, description, image, uri };
    })
}

function parserDetails(htmlDocument, animeObject) {
    const categories = [...htmlDocument.querySelectorAll('.Nvgnrs a')];
    const description = htmlDocument.querySelector(".Description p");
    animeObject.categories = categories.map(category => category.textContent);
    animeObject.description = description.textContent;
    return animeObject;
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

async function fetchPage(page) {
    const response = await fetch(`https://www3.animeflv.net/browse?page=${page}`);
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(text, "text/html");
    return parserObject(htmlDocument);
}

async function fetchDetails(animeObject) {
    try {
        const response = await fetch(animeObject.uri)
        const text = await response.text();
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(text, "text/html");
        return parserDetails(htmlDocument, animeObject);
    } catch {
        animeObject.categories = [];
        return animeObject;
    }
}

async function dataCollector() {
    const TOTAL_PAGES = 149;
    let data = [];

    for (let element = 1; element <= TOTAL_PAGES; element++) {
        data.push(fetchPage(element));
    }

    data = await Promise.all(data);
    return data.reduce((a, b) => a.concat(b));
}

async function dataDetailCollector() {
    const animeObjects = await dataCollector();
    return Promise.all(animeObjects.map(animeObject => fetchDetails(animeObject)));
}

async function main() {
    download("data", JSON.stringify(await dataDetailCollector()));
}

main();