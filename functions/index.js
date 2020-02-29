const functions = require('firebase-functions');
const admin = require('firebase-admin');

const app = require('express')();
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();
app.use(cors);
//app.get('/:id', (req, res) => res.send(Widgets.getById(req.params.id)));

//! use this agian for updating user data
app.post('/uploadArtistImage', (req, res) => {
	db.collection('artists')
		.doc(req.body.uid)
		.update({
			artist_image: req.body.imgurl,
		})
		.then(() => {
			res.status(200).send('success');
			return;
		})
		.catch(err => {
			res.status(500).send(err);
		});
});

//! use this end point for update as well
app.post('/uploadArtist', (req, res) => {
	db.collection('artists')
		.doc(req.body.userData.uid)
		.update({
			artist_name: req.body.userData.name,
			artist_surname: req.body.userData.surname,
			account_created: true,
		})
		.then(() => {
			res.status(200).send('success');
			return;
		})
		.catch(err => {
			res.status(500).send(err);
		});
});
app.post('/uploadalbum', (req, res) => {
	db.collection('albums')
		.doc()
		.create({
			album_name: req.body.albumData.albumName,
			songCount: 0,
			genre: req.body.albumData.genre,
			artist: req.body.albumData.artist,
		})
		.then(() => {
			findIDfield();
			return;
		})
		.catch(err => {
			res.status(500).send(err);
		});

	const findIDfield = () => {
		console.log('started lookging for doc');
		db.collection('albums')
			.get()
			.then(snap => {
				snap.forEach(doc => {
					const data = doc.data();
					if (data.id === undefined) {
						console.log('found doc');
						setIDflield(doc.id);
					}
				});
				return;
			})
			.catch(err => {
				res.status(500).send(err);
			});
	};

	const setIDflield = docID => {
		db.collection('albums')
			.doc(doc.id)
			.update({
				id: doc.id,
			})
			.then(doc => {
				console.log('added id to doc');
				res.status(200).send(doc.data());
				return;
			})
			.catch(err => {
				res.status(500).send(err);
			});
	};
});
//app.put('/:id', (req, res) => res.send(Widgets.update(req.params.id, req.body)));
//app.delete('/:id', (req, res) => res.send(Widgets.delete(req.params.id)));
//app.get('/', (req, res) => res.send(Widgets.list()));

app.get('/getuseralbums', (req, res) => {
	let albums = [];

	db.collection('albums')
		.get()
		.then(snap => {
			let i = 0;
			snap.forEach(doc => {
				const data = doc.data();

				//console.log(data.artist + ' ' + req.params.uid);
				if (data.artist === req.query.uid) {
					const album = {
						id: doc.id,
						coverImage: data.album_cover,
						albumName: data.album_name,
						songCount: data.song_count,
						genre: data.genre,
					};

					albums.push(album);
				}
				if (i === snap.docs.length - 1) {
					//	console.log(albums);
					res.status(200).send(albums);
				}
				i++;
			});
			return;
		})
		.catch(err => {
			res.status(500).send(err);
		});
});

exports.createArtist = functions.auth.user().onCreate(user => {
	db.collection('artists')
		.doc(user.uid)
		.create({
			uID: user.uid,
			artist_image:
				'https://firebasestorage.googleapis.com/v0/b/dotify-eb26e.appspot.com/o/placeholderImages%2Fdefault-artist.png?alt=media&token=7e78fb96-2b8a-436c-85e5-fc35e6a0ff53',
			account_created: false,
		});
});

exports.api = functions.https.onRequest(app);
