const fetch = require('node-fetch');

function getYearRange(year) {
  const fromDate = new Date(`${year}-01-01T00:00:00`);
  const toDate = new Date(`${year + 1}-01-01T00:00:00`);
  const getPacificEpoch = (date) => {
    const zonedString = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    return Math.floor(new Date(zonedString).getTime() / 1000);
  };

  return {
    from: getPacificEpoch(fromDate),
    to:   getPacificEpoch(toDate)
  };
}

// california on top!
const pacificYear = new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric'
});

let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION_MS = 15 * 1000; // 15 seconds
const { from, to } = getYearRange(parseInt(pacificYear));


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
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&from=${from}&to=${to}&api_key=${apiKey}&format=json&limit=1`
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
