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

//!use for update album image as well
app.post('/uploadAlbumImage', (req, res) => {
	db.collection('albums')
		.doc(req.body.currentAlbum)
		.update({
			album_cover: req.body.imgurl,
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
			song_count: 0,
			genre: req.body.albumData.genre,
			artist: req.body.albumData.artist,
			album_cover:
				'https://firebasestorage.googleapis.com/v0/b/dotify-eb26e.appspot.com/o/placeholderImages%2Fdefault-album.png?alt=media&token=d5bf5d5a-d210-4bb6-bcf2-4c98fdc0d2e9',
			artist_name: req.body.albumData.artistName,
		})
		.then(() => {
			findIDfield();
			uploadGenre();
			return;
		})
		.catch(err => {
			res.status(500).send(err);
		});

	const uploadGenre = () => {
		db.collection('genres')
			.doc('Kwp538DVPUTuhYJmVXlh')
			.get()
			.then(doc => {
				if (
					!doc.data().genres.includes(req.body.albumData.genre.toLowerCase())
				) {
					setGenre(doc.data().genres);
				}
				return;
			})
			.catch(err => {
				res.status(500).send(err);
			});
	};
	const setGenre = genres => {
		db.collection('genres')
			.doc('Kwp538DVPUTuhYJmVXlh')
			.update({ genres: [...genres, req.body.albumData.genre.toLowerCase()] });
	};
	const findIDfield = () => {
		db.collection('albums')
			.get()
			.then(snap => {
				snap.forEach(doc => {
					const data = doc.data();
					if (data.id === undefined) {
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
			.doc(docID)
			.update({
				id: docID,
			})
			.then(() => {
				returnData(docID);

				return;
			})
			.catch(err => {
				res.status(500).send(err);
			});
	};

	const returnData = docID => {
		db.collection('albums')
			.doc(docID)
			.get()
			.then(doc => {
				const docData = doc.data();
				const data = {
					id: docData.id,
					coverImage: docData.album_cover,
					albumName: docData.album_name,
					genre: docData.genre,
					songCount: docData.song_count,
					artist: docData.artist,
					artistName: docData.artist_name,
				};
				res.status(200).send(data);
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
						artist: data.artist,
						artistName: data.artist_name,
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

app.get('/getgenrealbums', (req, res) => {
	let albums = [];

	db.collection('albums')
		.get()
		.then(snap => {
			let i = 0;
			snap.forEach(doc => {
				const data = doc.data();

				//console.log(data.artist + ' ' + req.params.uid);
				if (data.genre === req.query.genre) {
					const album = {
						id: doc.id,
						coverImage: data.album_cover,
						albumName: data.album_name,
						songCount: data.song_count,
						genre: data.genre,
						artist: data.artist,
						artistName: data.artist_name,
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

app.get('/getallgenres', (req, res) => {
	db.collection('genres')
		.doc('Kwp538DVPUTuhYJmVXlh')
		.get()
		.then(snap => {
			const genres = snap.data().genres;
			res.status(200).send(genres);
			return;
		})
		.catch(err => {
			res.status(500).send(err);
		});
});
app.get('/getallalbums', (req, res) => {
	let albums = [];

	db.collection('albums')
		.get()
		.then(snap => {
			let i = 0;
			snap.forEach(doc => {
				const data = doc.data();
				const album = {
					id: doc.id,
					coverImage: data.album_cover,
					albumName: data.album_name,
					songCount: data.song_count,
					genre: data.genre,
					artist: data.artist,
					artistName: data.artist_name,
				};
				albums.push(album);
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

app.get('/getallartists', (req, res) => {
	let artists = [];

	db.collection('artists')
		.get()
		.then(snap => {
			let i = 0;
			snap.forEach(doc => {
				const data = doc.data();
				const artist = {
					imageUrl: data.artist_image,
					artistName: data.artist_name,
					artistSurname: data.artist_surname,
					uid: data.uID,
				};
				artists.push(artist);
				if (i === snap.docs.length - 1) {
					res.status(200).send(artists);
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
