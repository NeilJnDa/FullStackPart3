const mongoose = require('mongoose')

const url = process.env.MONGODB_URL

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) =>{
        console.log('connection failed: ', error)
    })


const personSchema = mongoose.Schema({
    name: String,
    number: String
})
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})
module.exports = mongoose.model('person', personSchema )
  

