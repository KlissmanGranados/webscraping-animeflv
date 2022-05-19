# Webscraping animeflv

Objetivo: descargar una lista de datos desde animeflv usando el navegador web y guardarla en un json; en ese sentido, se debe subir la multimedia hacia algun bucket, en este caso se usara google cloud, empleando el microservicio [files-server](https://github.com/KlissmanGranados/files-server) y finalmente, insertar esta informacion en una base de datos postgresql. Para poder emplear esta data en la implementacion de un servicio rest, adjunto enlace de la documentación en swagger: https://anime-ws.herokuapp.com/api/documentation.

### Pasos:

1. Crear un [store.json](./data/store.json), ejecutando el script [fetch-browser.js](data/fetch-browser.js) en alguna ventana que tenga abierta la ruta: https://www3.animeflv.net/, de esta forma, se iteran todas las paginas actuales y en cada elemento se hace otra llamada para recuperar mas detalles acerca de cada elemento.

    ```JSON
        [
            {
                "title":"Shin Ikkitousen",
                "description":"Sellados en joyas antiguas ... ",
                "image":"https://animeflv.net/uploads/animes/covers/3626.jpg",
                "uri":"https://www3.animeflv.net/anime/"
            } 
        ]
    ```

2. [Guardar las images en un directorio local](/data/dowload-images.js), este script descarga los binarios y los almacena en el directorio que se le especifique ejecutando 20 descargas paralelas entre la cantidad de imagenes totales.

3. [Subir binarios hacia google cloud](/data/upload-images.js), en este punto se toman los binarios descargados y se le pasan al microservicio [files-server](https://github.com/KlissmanGranados/files-server) por http tomando 20 archivos de forma simultanea entre la cantidad de elementos resultantes y se genera una version de [store.json](./data/store.json) con el nombre de "data.json", el cual tendra en cada imagen el url que concierna a cada caso.

4. [Importar base de datos](/data/dump.sql).

5. [Insertar todos los datos desde data.json hacia la estructura creada](/data/json-to-db.js).
