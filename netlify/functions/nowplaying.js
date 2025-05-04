const fetch = require('node-fetch');

let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION_MS = 15 * 1000; // 15 seconds

exports.handler = async function(event, context) {
    const apiKey = process.env.LASTFM_API_KEY;
    const username = process.env.LASTFM_USERNAME;
    const now = Date.now();

    // cache so it doesnt call as much
    if (cachedData && now - lastFetched < CACHE_DURATION_MS) {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(cachedData),
        };
    }

    try {
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`
        );
        const data = await response.json();

        // store in cache
        cachedData = data;
        lastFetched = now;

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
