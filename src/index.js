import express from 'express'
import { Server as HttpServer } from 'http'
import { Server as IOServer } from 'socket.io'
import faker from 'faker'
import { normalize, denormalize, schema } from 'normalizr'

import routerProductos from './router/routerProductos.js'
import routerCarrito from './router/routerCarrito.js'
import ContenedorArchivo from './contenedores/ContenedorArchivo.js'
import { instanciasDaos } from './daos/index.js'

const DaoMensajes = instanciasDaos.DaoMensajes

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', express.static('public'))
app.use('/uploads', express.static('src/uploads'))

app.use('/api/productos', routerProductos)
app.use('/api/carrito', routerCarrito)

app.get('/api/productos-test', (req, res) => {
    const productos = []
    for (let i = 0; i < 5; i++) {
        const nuevoProducto = {
            nombre: `${faker.name.firstName()}  ${faker.name.lastName()}`,
            precio: parseInt(faker.commerce.price()),
            foto: faker.image.avatar()
        }
        productos.push(nuevoProducto)
    }

    res.json({msj: 'Productos Test Mock con Faker.js', productos})
})

/* Manejar cualquier ruta que no este implementada en el servidor */
app.all('*', (req, res) => {
    res.json({ error : -2, descripcion: `ruta '${req.url}' método ${req.method} no implementada`})
})

io.on('connection', async (socket) => { 
    //"connection" se ejecuta la primera vez que se abre una nueva conexión
    console.log('Usuario conectado') // Se imprimirá solo la primera vez que se ha abierto la conexión
    // ContenedorMsjs.createtable()
    const msjs = await DaoMensajes.getAll()

    const user = new schema.Entity('users', {}, {idAttribute: 'email'})

    const mensaje = new schema.Entity('mensajes', {
        author: user
    });

    const chats = new schema.Entity('chats', {
        mensajes: [mensaje]
    });

    const originalData = {
        id: "999",
        mensajes: msjs
    }

    const normalizedData = normalize(originalData, chats)

    socket.on('msj', async (mensajeNuevo) => {
        try {
            await DaoMensajes.save(mensajeNuevo)
            const msjs = await DaoMensajes.getAll()
            const normalizedData = normalize({
                id: "999",
                mensajes: msjs
            }, chats)

            io.sockets.emit('msjs', normalizedData)
        } catch (error) {
            console.log(error)
        }
    })

    socket.emit('msjs', normalizedData) 
})

const PORT = process.env.PORT || 8080

const server = httpServer.listen(PORT, () => {
    console.log(`Ya me conecte al puerto ${server.address().port} !!`)
})

server.on('error', (error) =>{
    console.log('hubo un error....')
    console.log(error)
})