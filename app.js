require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { downloadSketchFab } = require('./sketchfab')
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: true })

app.use(cors())
app.use(express.static('../../public_html/blockland/'))
app.use(express.static('../../public_html/libs'))
app.use(express.static('../../public_html/blockland/v3'))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '../../public_html/blockland/v3/index.html')
})
app.use('/models', express.static('models'))
app.get('/loadModel/:uid', async (req, res) => {
  try {
    await downloadSketchFab(req.params.uid)
    res.send(true)
  } catch (err) {
    console.error(err)
    res.send(false)
  }
})

io.on('connection', function (socket) {
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 } //Default values;

  console.log(`${socket.id} connected`)
  socket.emit('setId', { id: socket.id })

  socket.on('init', function (data) {
    console.log(`socket.init ${data.model}`)
    socket.userData = { ...socket.userData, ...data }
    socket.userData.action = 'CharacterArmature|Idle'
  })

  socket.on('update', function (data) {
    socket.userData = { ...socket.userData, ...data }
  })

  socket.on('updateData', ({ player, models }) => {
    socket.userData = { ...socket.userData, ...player, models }
  })
})

http.listen(2002, function () {
  console.log('listening on *:2002')
})

setInterval(function () {
  const nsp = io.of('/')
  const players = []
  const models = []

  nsp.sockets.forEach((socket) => {
    if (socket.userData.model) {
      const { models: userModels, ...userData } = socket.userData
      players.push({ id: socket.id, ...userData })
      models.push(...Object.values(userModels || {}))
    }
  })

  if (players.length > 0) io.emit('remoteData', { players, models })
}, 40)
