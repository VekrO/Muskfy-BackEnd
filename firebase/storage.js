const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  keyFilename: "./firebase/muskfy-firebase-adminsdk-gbr25-a7a586f5a0.json",
});
const storageBucket = storage.bucket("muskfy.appspot.com"); 

module.exports = {
  storageBucket
}