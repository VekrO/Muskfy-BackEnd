const express = require("express");
const path = require("path");
const route = express.Router();
const ytdl = require("ytdl-core");
const fs = require("fs");
const crypto = require("crypto");
const { storageBucket } = require('./firebase/storage');
const database = require('./firebase/database');
const { search } = require('./youtube');

route.post("/download", async (req, res) => {

  req.body.video_id = String(req.body.video_id).substring(0, 11);
  
  // Verifica se aúdio já existe.
  const doc = await database.get(req.body.video_id);

  if(doc.exists){
    return res.status(404).json({
      message: 'O arquivo já existe, não é necessário baixar novamente!',
    });
  }
  
  const videoUrl = "https://www.youtube.com/watch?v=" + req.body.video_id; // Substitua YOUR_VIDEO_ID pelo ID do vídeo do YouTube que você deseja baixar.

  try {

    const info = await ytdl.getInfo(videoUrl);

    const audioFormat = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
    });

    if (!audioFormat) {
      return res.status(400).json({
        error:
          "O vídeo não contém um formato de áudio disponível para download.",
      });
    }

    const audioReadableStream = ytdl(videoUrl, { format: audioFormat });

    // Cria um hash temporário para deixar como nome do arquivo gerado.
    const randomData = crypto.randomBytes(16);
    const hash = crypto.createHash("sha256");
    hash.update(randomData);

    const outputPath = path.join(__dirname, hash.digest("hex") + ".mp3");
    const fileWriteStream = fs.createWriteStream(outputPath);

    audioReadableStream.pipe(fileWriteStream);

    fileWriteStream.on("finish", () => {

        storageBucket.upload(outputPath).then( async (result) => {

            // Música salva, salvar os detalhes da música como link para acesso, title, views, thumbnail...
  
            const options = {

              /* title: info.videoDetails.title,
              views: info.videoDetails.viewCount,
              thumbnail: info.videoDetails.thumbnails,
              duration: info.videoDetails.lengthSeconds,
              author: info.videoDetails.author,
              published_date: info.videoDetails.publishDate,
              videoId: info.videoDetails.videoId,
              downloaded: true,
              audio_url: result[0].publicUrl(),
              created_at: new Date().toDateString(), */

              id: {
                videoId: info.videoDetails.videoId
              },
              snippet: {
                  channelId: info.videoDetails.channelId,
                  channelTitle: info.videoDetails.author.name,
                  description: info.videoDetails.description,
                  thumbnails: info.videoDetails.thumbnails,
                  title: info.videoDetails.title
              },
              thumbnail: info.videoDetails.thumbnails,
              downloaded: true,
              audio_url: result[0].publicUrl()

            }

            try {

              await database.save(options);
              const music = await database.get(options.id.videoId);

              return res.status(200).json(music.data());

            } catch (error) {
              console.log('ERRO: ', error);
              return res.status(500).json({
                error
              })
            }


        }).catch((err) => {

            return res.status(200).json({
              message: err.error.message
            });

        }).finally(()=>{

            fs.unlink(outputPath, (err) => {
                if (err) {
                  console.error('Erro ao excluir o arquivo de áudio temporário:', err);
                }
            });

        })

    });

    fileWriteStream.on("error", (err) => {
      console.error("Erro ao gravar o arquivo de áudio:", err);
      res.status(500).json({ error: "Erro ao gravar o arquivo de áudio." });
    });

  } catch (error) {
    console.error("Erro ao obter informações do vídeo:", error);
    res.status(500).json({ error: "Erro ao obter informações do vídeo." });
  }
});

route.get('/getAll', async (req, res) => {

  const musics = await database.getAll();
  console.log('musics: ', musics);
  return res.json(musics)

});

route.get('/search/:query', async (req, res) => {

  const videos = await search(req.params.query);
  if(videos.length > 0){
    console.log('resultado: ', res);
    return res.status(200).json(videos);
  }else{
    return res.status(500).json({
      message: videos
    });
  }

});

module.exports = route;
