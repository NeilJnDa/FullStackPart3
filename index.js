require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/phonebook');

const app = express();

//  Middlewares in order
//  1. Use the imported frontend build
app.use(express.static('build'));
//  2. Json parser
app.use(express.json());
//  3. logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :detail'));
morgan.token('detail', (req) => JSON.stringify(req.body));

//  Deal with http requests
app.get('/', (request, response) => { response.send('<h1>Hi!</h1>'); });
app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then((persons) => {
            //  console.log(persons)
            response.json(persons);
        })
        .catch((error) => next(error));
});
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then((person) => {
        if (person) {
            console.log('person: %d', person);
            response.json(person);
        } else {
            console.log('404');
            response.status(404).end();
        }
    })
        .catch((error) => next(error));
});
app.put('/api/persons/:id', (request, response, next) => {
    const { body } = request;
    Person.findByIdAndUpdate(
        request.params.id,
        { $set: { number: body.number } },
        { new: true, runValidators: true },
    )
        .then((person) => {
            if (person) {
                console.log(person);
                response.json(person);
            } else {
                console.log('404');
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});
app.get('/info', (request, response) => {
    Person.countDocuments({}, (err, count) => {
        if (err) {
            console.log(err);
            response.status(404).end();
        } else {
            console.log('Count :', count);
            response.write(`<p>Phonebook has info for ${count} people</p>`);
            response.write(`<p>${new Date().toString()}</p>`);
            response.end();
        }
    });
});
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch((error) => next(error));
    response.status(204).end();
});
app.post('/api/persons', (request, response, next) => {
    const { body } = request;
    // console.log(body)
    if (!body) {
        return response.status(400).json({
            error: 'Content missing',
        });
    }

    // Checking for the same name is handled in frontend code
    // else if(Person.exists({'name' : body.name})){
    //     Person.findOneAndUpdate({"name" : body.name}, { $set: {number: body.number}})
    //     response.json({"name" : body.name}, {number: body.number})
    // }

    // Create a new document from the model
    console.log(`Create new: ${body.name}`);
    const newPerson = new Person({
        name: body.name,
        number: body.number,
    });

    newPerson.save().then((savedPerson) => {
        response.json(savedPerson);
    })
        .catch((error) => next(error));
    return null;
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 4. Unknown endpoint
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

// 5. error handler
// When call next() with a parameter "error", this middleware is called
const errorHandler = (error, request, response, next) => {
    console.error('ErrorHandler', error.name);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }
    // Pass to default error handler of Express
    // Note that the error handling middleware has to be the last loaded middleware!
    next(error);
    return null;
};
app.use(errorHandler);
