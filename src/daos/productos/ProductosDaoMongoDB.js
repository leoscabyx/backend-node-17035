import ContenedorMongoDB from "../../contenedores/ContenedorMongoDB.js"

class ProductosDaoMongoDB extends ContenedorMongoDB {

    constructor() {
        super('productos', {
            id: { type: Number, required: true },
            timestamp: { type: Date, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },
            code: { type: String, required: true },
            price: { type: Number, required: true },
            thumbnail: { type: String, required: true },
            stock: { type: Number, required: true },
        })
    }

    /* Actualizar un producto segun su id */
    async updateById(producto, id) {
        try {
            const obtenerProductos = await this.getAll()

            if(obtenerProductos && obtenerProductos.length > 0) {

                await this.coleccion.updateOne({id: id}, { $set: { 
                    title: producto.title, 
                    description: producto.description, 
                    code: producto.code, 
                    price: producto.price, 
                    thumbnail: producto.thumbnail, 
                    stock: producto.stock 
                }})
    
                const result = await this.coleccion.find({id: id})
    
                return result
    
            }else{
                return null
            }
        } catch (error) {
            logger.error(error)
        }
    }
}

export default ProductosDaoMongoDB