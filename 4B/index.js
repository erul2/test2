const http = require('http')
const express = require('express')
const path = require('path')
const hbs = require('hbs')
const session = require('express-session')
const db = require('./connection/db')

const app = express()
app.use(express.json())
app.use(express.static('express'))
app.use(express.urlencoded({
    extended: false
}))

// use session
app.use(
    session({
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: 'secretkey'
    })
)

// setup flash message
app.use(function (request, response, next) {
    response.locals.message = request.session.message
    delete request.session.message
    next()
})

app.use('/public', express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

hbs.registerPartials(__dirname + '/views/partials');

// home page
app.get('/', (req, res) => {
    const query = `SELECT * from collections_tb`
    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            res.render('index', {
                title: 'Task Collections',
                collections: results,
                isLogin: req.session.isLogin
            })
        })

        conn.release()
    })
})

// login page
app.get('/login', (req, res) => {
    res.render('login', {
        auth: true
    })
})

// register page
app.get('/register', (req, res) => {
    res.render('register', {
        auth: true
    })
})

// collections page
app.get('/collection/:id', (req, res) => {
    const query = `SELECT * FROM task_tb WHERE collections_id = ${req.params.id}`
    const own = `SELECT user_id,name from collections_tb where id = ${req.params.id}`
    db.getConnection((e, conn) => {
        let owner = false
        let coll = ''
        conn.query(own, (e, results) => {
            if (req.session.isLogin) {
                (results[0].user_id == req.session.user.id) ? owner = true: null
            }
            coll = results[0].name
        })
        conn.query(query, (e, results) => {
            if (e) throw e
            let task = []
            let taskd = []
            if (results != 0) {
                for (t of results) {
                    if (t.is_done) {
                        taskd.push(t)
                    } else {
                        task.push(t)
                    }
                }
            }
            res.render('collection', {
                title: `Collection`,
                task,
                taskd,
                coll,
                collId: req.params.id,
                owner,
                isLogin: req.session.isLogin
            })
            console.log(task)
        })
        conn.release()
    })
})

// register process
app.post('/register', (req, res) => {
    const {
        email,
        username,
        password
    } = req.body

    const query = `INSERT INTO user_tb (email,username,password) VALUES ("${email}","${username}","${password}")`
    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) {
                req.session.message = {
                    type: 'danger',
                    message: 'User with that email or username already exists'
                }
            }
            req.session.message = {
                type: 'success',
                message: 'Your Account Succesfully Registered'
            }
            res.redirect('/register')
        })
        conn.release()
    })
})

// login process
app.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body

    const query = `SELECT *, MD5(password) AS password FROM user_tb WHERE email = "${email}" AND password = "${password}"`
    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            if (results.length == 0) {
                req.session.message = {
                    type: 'danger',
                    message: 'Please check your email or password'
                }
                res.redirect('/login')
            } else {
                req.session.message = {
                    type: 'success',
                    message: 'You are loged'
                }
                req.session.isLogin = true
                req.session.user = {
                    id: results[0].id,
                    email: results[0].email,
                    username: results[0].username
                }
                res.redirect('/')
            }
        })
        conn.release()
    })
})

// logout process 
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

// --- COLECTIONS ---
// create collections
app.post('/collection', (req, res) => {
    const {
        name
    } = req.body
    const uid = req.session.user.id
    const query = `INSERT INTO collections_tb (name, user_id) VALUES ("${name}","${uid}")`

    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            req.session.message = {
                type: 'success',
                message: 'Collection Added'
            }
            res.redirect(`/collection/${results.insertId}`)
        })
        conn.release()
    })
})

// edit collection
app.post('/edit-collection', (req, res) => {
    const {
        name,
        id
    } = req.body
    const query = `UPDATE collections_tb SET name="${name}" WHERE id = ${id}"`

    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            req.session.message = {
                type: 'succes',
                message: 'Collection Edited'
            }
            res.redirect(`/collection/${id}`)
        })
        conn.release()
    })
})

// delete collection
app.get('/delete-collection/:id', (req, res) => {
    const query = `DELETE FROM collections_tb WHERE id = ${req.params.id}`
    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            req.session.message = {
                type: 'success',
                message: 'Collection Deleted'
            }
            res.redirect('/')
        })
        conn.release()
    })
})

// --- TASK ---
// create task
app.post('/task', (req, res) => {
    const {
        name,
        coll_id
    } = req.body
    const query = `INSERT INTO task_tb (name, collections_id) VALUES ("${name}","${coll_id}")`

    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            req.session.message = {
                type: 'success',
                message: 'Task Added'
            }
            res.redirect(`/collection/${coll_id}`)
        })
        conn.release()
    })
})

// edit task
app.post('/edit-task', (req, res) => {
    const {
        name,
        coll_id
    } = req.body
    const query = `UPDATE task_tb SET name="${name}" WHERE id = ${coll_id}"`

    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            req.session.message = {
                type: 'succes',
                message: 'Task Edited'
            }
            res.redirect(`/collection/${id}`)
        })
        conn.release()
    })
})

// delete task
app.get('/delete-task/:id/:coll', (req, res) => {
    res.redirect('/collections/id')
    const query = `DELETE FROM task_tb WHERE id = ${req.params.id}`
    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            req.session.message = {
                type: 'success',
                message: 'Collection Deleted'
            }
            res.redirect(`/collection/${req.params.coll}`)
        })
        conn.release()
    })
})

// set done task
app.get('/done-task/:id/:coll', (req, res) => {

    const query = `UPDATE task_tb SET is_done = true WHERE id = ${req.params.id}`

    db.getConnection((e, conn) => {
        conn.query(query, (e, results) => {
            if (e) throw e
            req.session.message = {
                type: 'succes',
                message: 'Task Updated'
            }
            res.redirect(`/collection/${req.params.coll}`)
        })
        conn.release()
    })
})


// server config
const server = http.createServer(app)
const PORT = 3000
server.listen(PORT)
console.debug('Server listening on port ' + PORT)

hbs.handlebars.registerHelper('isAuth',
    function (value) {
        if (value == true) {
            return false;
        } else {
            return true;
        }
    }
)