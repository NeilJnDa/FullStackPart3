const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :detail'))
morgan.token('detail', function (req, res) { return JSON.stringify(req.body)})
let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }

]
app.get('/', (request, response) => {
    response.send('<h1>Hi!</h1>')
})
app.get('/api/persons', (request, response) => {
    response.json(persons)
})
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(x => x.id === id)
    if(person){
        response.json(person)
        console.log(person)
    }
    else{
        response.status(404).end()
        console.log("404")
    }

})
app.get('/info', (request, response) => {
    response.write(`<p>Phonebook has info for ${persons.length} people</p>`)
    response.write(`<p>${new Date().toString() }</p>`)
    //console.log(new Date().toString())
    response.end()
})
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(x => x.id !== id)
    response.status(204).end()
})
app.post('/api/persons', (request, response) => {
    const body = request.body
    //console.log(body)
    if (!body) {
      return response.status(400).json({ 
        error: 'Content missing' 
      })
    }
    else if(!body.name){
        return response.status(400).json({ 
            error: 'Name missing' 
        })
    }
    else if(persons.map(x => x.name).includes(body.name)){
        return response.status(400).json({ 
            error: 'Name must be unique' 
        })
    }
    else if(!body.number){
        return response.status(400).json({ 
            error: 'Number missing' 
        })
    }
    
  
    const newPerson = {
      id: getRandomInt(100000),
      name: body.name,
      number: body.number
    }
  
    persons = persons.concat(newPerson)
    response.json(newPerson)
  })

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
  
const PORT = process.env.PORT || 3001
const HOST = "0.0.0.0"
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


