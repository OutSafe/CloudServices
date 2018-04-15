const functions = require('firebase-functions');
const admin = require('firebase-admin');

const SAFE_DIST = 15;

admin.initializeApp()

var database = admin.database();

function distance(lat1, lon1, lat2, lon2) {
	var deltaLat = (lat2 - lat1) * Math.PI/180;
	var deltaLon = (lon2 - lon1) * Math.PI/180;
	var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return c * 20925721.785;
}

exports.postEvent = functions.database.ref('/{buildingId}/event/{eventId}')
	.onCreate((snapshot, context) => {
		var event_dict = snapshot.val();
		console.log(event_dict);
		var buildingId = context.params.buildingId;
		//Check distances between point and exits
		//From for loop exit_ref;
		var ret = false;
		database.ref(buildingId + '/exit').once('value', function(s) {
			var exits = s.val();
			for(var e in exits) {
				var exit = exits[e];
				var is_in_danger = distance(event_dict.lat, event_dict.lon, exit.lat, exit.lon);
				console.log(is_in_danger + " " + e);
				if(is_in_danger <= SAFE_DIST) {
					ret = true;
					database.ref(buildingId + '/exit/' + e).update({status: false})
				}
			}
		});
		//TODO notification here
		database.ref('_tokens').once('value', function(snapshot) {
			snapshot.forEach(function(child) {
				var token = child.val()['token'];
				console.log(token);
				admin.messaging().send({
					token: token,
					data: {
						changed: 'true'
					}
				});
			});
		});
		
		return true;
})

exports.removeEvent = functions.database.ref('/{buildingId}/event/{eventId}')
	.onDelete((snapshot, context) => {
		var buildingId = context.params.buildingId;
		//Check distances between point and exits
		//From for loop exit_ref;
		database.ref(buildingId + '/exit').once('value', function(s) {
			var exits = s.val();
			database.ref(buildingId + '/event').once('value', function(s2) {
				var events = s2.val();
				for(var e in exits) {
					var exit = exits[e];
					var ret = true;
					for(var ev in events) {
						var evt = events[ev];
						var is_in_danger = distance(evt.lat, evt.lon, exit.lat, exit.lon);
						console.log(is_in_danger + " " + e);
						if(is_in_danger <= SAFE_DIST) {
							ret = false;
							break;
						}
					}
					database.ref(buildingId + '/exit/' + e).update({status: ret})
				}
			});
		});
		database.ref('_tokens').once('value', function(snapshot) {
			snapshot.forEach(function(child) {
				var token = child.val()['token'];
				console.log(token);
				admin.messaging().send({
					token: token,
					data: {
						changed: 'true'
					}
				});
			});
		});
		return true;
})
