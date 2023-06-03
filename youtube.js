const axios = require('axios');

async function search(query){

    const url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_DATA_APIKEY}&type=video&part=snippet&maxResults=10&q=${query}`;

    let videos = [];

    await axios.get(url).then((result) => {

        (result.data.items).forEach((video) => {
            console.log('video; ', video);
            const item =  {
                id: {
                    videoId: video.id.videoId
                },
                snippet: {
                    channelId: video.snippet.channelId,
                    channelTitle: video.snippet.channelTitle,
                    description: video.snippet.description,
                    thumbnails: [
                        {
                            height: video.snippet.thumbnails.default.height,
                            width: video.snippet.thumbnails.default.width,
                            url: video.snippet.thumbnails.default.url
                        },
                        {
                            height: video.snippet.thumbnails.high.height,
                            width: video.snippet.thumbnails.high.width,
                            url: video.snippet.thumbnails.high.url
                        },
                        {
                            height: video.snippet.thumbnails.medium.height,
                            width: video.snippet.thumbnails.medium.width,
                            url: video.snippet.thumbnails.medium.url
                        }
                    ],
                    title: video.snippet.title
                },
                thumbnail: [
                    {
                        height: video.snippet.thumbnails.default.height,
                        width: video.snippet.thumbnails.default.width,
                        url: video.snippet.thumbnails.default.url
                    },
                    {
                        height: video.snippet.thumbnails.high.height,
                        width: video.snippet.thumbnails.high.width,
                        url: video.snippet.thumbnails.high.url
                    },
                    {
                        height: video.snippet.thumbnails.medium.height,
                        width: video.snippet.thumbnails.medium.width,
                        url: video.snippet.thumbnails.medium.url
                    }
                ],
                downloaded: false,
                audio_url: null
            }

            videos.push(item);

        });

        videos = result.data.items;


    }).catch((error) => {
        console.log('error: ' , error.message);
    });

    return videos;

}

module.exports = {
    search
};