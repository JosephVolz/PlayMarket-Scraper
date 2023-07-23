const cheerio = require('cheerio');
const axios = require('axios');

const url = 'https://play.google.com/store/apps/category/GAME';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  }
};

// Define a function that scrapes the data for a single game
async function scrapeGame(url) {
  const response = await axios.get(url, options);
  const $ = cheerio.load(response.data);

  // Extract the game category
  const category = $('span[itemprop="genre"]').text();

  // Extract the game name
  const name = $('h1[itemprop="name"]').text();

  // Extract the number of downloads
  const downloads = $('div[itemprop="numDownloads"]').text();

  // Extract the name of the game developer
  const developer = $('a[href^="/store/apps/dev?id="]').text();

  // Extract the rating ratio
  const rating = $('div[class^="BHMmbe"]').first().text();

  // Return the extracted data as an object
  return {
    category,
    name,
    downloads,
    developer,
    rating
  };
}

// Define a function that scrapes the data for all games in a given URL
async function scrapeGames(url) {
  const response = await axios.get(url, options);
  const $ = cheerio.load(response.data);

  // Extract the URLs for all games on the page
  const gameUrls = $('a[href^="/store/apps/details?id="]')
    .map((i, el) => $(el).attr('href'))
    .get();

  // Scrape the data for each game and return an array of objects
  const games = await Promise.all(gameUrls.map(url => scrapeGame('https://play.google.com' + url)));
  return games;
}

// Call the scrapeGames function with the desired URL to scrape the data for all games on the page
scrapeGames(url).then(games => {
  console.log(games);
});