var fs = require('fs')
var http = require('http')
var https = require('https')
var privateKey  = fs.readFileSync('/home/rena/containers/frontend/certbot/config/live/cat.bio/privkey.pem', 'utf8')
var certificate = fs.readFileSync('/home/rena/containers/frontend/certbot/config/live/cat.bio/cert.pem', 'utf8')

var credentials = {key: privateKey, cert: certificate}
var express = require('express')
var app = express()

const Mopidy = require("mopidy")

const mopidy = new Mopidy({
  webSocketUrl: "ws://localhost:6680/mopidy/ws/",
})

function printApis(name, a) {
  console.log(name + ":")
  console.log(Object.keys(a))
}


mopidy.on("state", console.log)
mopidy.on("event", console.log)

function searchAndPlay(term) {
  //mopidy.library.search({ query: "abba", exact: true })
  mopidy.library.search({ query: {'any': [term] } })
  .then((res) => {
    let track = res[0].tracks[0]
          console.log(track)  
    console.log('playing ' + track.uri)
    return mopidy.tracklist.add({uris: [ track.uri ] })
    //console.log(Object.keys(mopidy.playback))
  })
  .then((a) => {
    console.log(a)
    return mopidy.playback.play({tlid: a[0].tlid})
  })
  .then(console.log)
  .catch(console.error)
}

mopidy.on("state:online", () => {
  printApis("playback", mopidy.playback)
  printApis("tracklist", mopidy.tracklist)
  printApis("library", mopidy.library)
  printApis("playlists", mopidy.playlists)
  printApis("history", mopidy.history)
  printApis("mixer", mopidy.mixer)
})

// your express configuration here

app.use(express.json())

var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app)

app.post('/', function (req, res) {
  let term = req.body.term
  console.log(term)
  searchAndPlay(term)
  res.send('POST request to the homepage')
})

httpServer.listen(15070)
httpsServer.listen(15071)
