var express = require('express')
var path = require('path')
var app = express()
var bodyParser = require('body-parser')

app.use(bodyParser.json())

var firebase = require('firebase-admin')
var firebase_config = require('./Codefest2018-c9de1c4a80a1.json')

firebase.initializeApp({
  credential: firebase.credential.cert(firebase_config),
  databaseURL: 'https://codefest2018-201115.firebaseio.com'
})

var database = firebase.database()

const PORT = process.env.PORT || 5000

app.get('/:buildingId/exit', function(req, res) {
	//Here is where we need to do auth
	//req.headers.TOKEN
	//firebase.auth().verifyIdToken()
	
	exitRef = database.ref(req.params.buildingId + '/exit/')
	exitRef.once('value', function(snapshot) {
		res.status(200).json(snapshot.val())
	})
})

app.post('/:buildingId/exit', function(req, res) {
	//Here is where we need to do auth
	//req.headers.TOKEN
	//firebase.auth().verifyIdToken()
	
	exitRef = database.ref(req.params.buildingId + '/exit/')
	//Verification happens here - SIKE
	body = req.body
	//Make child node under exit
	//console.log(body)
	retRef = exitRef.push()
	retRef.set({
		'lat': body.lat,
		'lon': body.lon,
		'el': body.el,
		'type': (body.type?body.type:'door'),
		'status': true
	}).then(function() {
		retRef.once('value', function(snapshot) {
			ret = snapshot.val()
			ret.id = snapshot.key
			res.status(200).json(ret)
		})
	})
})

app.get('/:buildingId/landmark', function(req, res) {
	//Here is where we need to do auth
	//req.headers.TOKEN
	//firebase.auth().verifyIdToken()
	exitRef = database.ref(req.params.buildingId + '/landmark/')
	exitRef.once('value', function(snapshot) {
		res.status(200).json(snapshot.val())
	})
})

app.post('/:buildingId/landmark', function(req, res) {
	//Here is where we need to do auth
	//req.headers.TOKEN
	//firebase.auth().verifyIdToken()
	
	landmarkRef = database.ref(req.params.buildingId + '/landmark/')
	//Verification happens here - SIKE
	body = req.body
	//Make child node under exit
	retRef = landmarkRef.push()
	retRef.set({
		'lat': body.lat,
		'lon': body.lon,
		'el': body.el,
		'label': (body.label ? body.label: "corner")
	}).then(function() {
		retRef.once('value', function(snapshot) {
			ret = snapshot.val()
			ret.id = snapshot.key
			res.status(200).json(ret)
		})
	})
})

app.get('/:buildingId/event', function(req, res) {
	//Here is where we need to do auth
	//req.headers.TOKEN
	//firebase.auth().verifyIdToken()

	eventsRef = database.ref(req.params.buildingId + '/event/')
	eventsRef.once('value', function(snapshot) {
		res.status(200).json(snapshot.val())
	})
})

app.post('/:buildingId/event', function(req, res) {
	//Here is where we need to do auth
	//req.headers.TOKEN
	//firebase.auth().verifyIdToken()
	
	eventsRef = database.ref(req.params.buildingId + '/event/')
	//Verification happens here
	body = req.body
	//Make child node under exit
	retRef = eventsRef.push()
	retRef.set({
		'lat': body.lat,
		'lon': body.lon,
		'el': body.el,
		'eventType': body.eventType
	}).then(function() {
		retRef.once('value', function(snapshot) {
			ret = snapshot.val()
			ret.id = snapshot.key
			res.status(200).json(ret)
		})
	})
})

app.delete('/:buildingId/event', function(req, res) {
	//Here is where we need to do auth
	//req.headers.TOKEN
	//firebase.auth().verifyIdToken()
	eventId = req.body.eventId
	eventsRef = database.ref(req.params.buildingId + '/event/' + eventId)
	//Verification happens here - SIKE
	eventsRef.remove().then(function() {
		res.status(200).json({eventId: false})
	})
})

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/usage.html')
})

app.listen(PORT, () => console.log('Server Initialized'))