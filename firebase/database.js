const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./muskfy-firebase-adminsdk-gbr25-a7a586f5a0.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function save(options){

  const result = await db.collection('musics').doc(options.id.videoId).set(options)
  return result;

}

async function get(video_id){

    const docRef = db.collection('musics').doc(video_id);
    const doc = await docRef.get();
    return doc;

}

async function getAll() {
  
  const docRef = db.collection('musics');
  const doc = await docRef.get();
  const musics = doc.docs.map((doc => doc.data()))
  return musics;

}

module.exports = {
    save,
    get,
    getAll
}