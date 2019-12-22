const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request');
const axios = require('axios');
const playlistFunctions = require('./utils/playlistFunctions');

require('dotenv').config();

const app = express();

app.use(express.static(`${__dirname}/public`))
  .use(cors())
  .use(cookieParser())
  .use(express.json());


const PORT = process.env.PORT || 3001;
app.get('/', (req, res) => {
  res.send('<h1>HEALTHY!</h1>');
});


const stateKey = 'spotify_auth_state';

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://localhost:3001/callback';


app.get('/login', (req, res) => {
  const randomString = playlistFunctions.generateRandomString(16);
  const originUrl = req.query.origin;
  const state = `${randomString}&${originUrl}`;
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope = 'user-read-playback-state';
  res.redirect(`https://accounts.spotify.com/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state,
    })}`);
});

app.get('/callback', async (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;
  console.log('req cookies', req.cookies);

  if (state === null || state !== storedState) {
    res.redirect(`/#${
      querystring.stringify({
        error: 'state_mismatch',
      })}`);
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: `Basic ${new Buffer(`${client_id}:${client_secret}`).toString('base64')}`,
      },
      json: true,
    };

    request.post(authOptions, async (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const { access_token } = body;
        const { refresh_token } = body;


        const options = {
          url: 'https://api.spotify.com/v1/me/player/currently-playing/',
          headers: { Authorization: `Bearer ${access_token}` },
          json: true,
        };

        // get the current playing track
        // const currentPlaylist = await axios.get(options.url, {
        //   headers: { Authorization: `Bearer ${access_token}` },
        // }).then((data) => data.data);

        // we can also pass the token to the browser to make requests from there
        const originUrl = state.slice(state.indexOf('&') + 1);
        res.redirect(`${originUrl}auth-callback/?origin=${originUrl}&token=${access_token}&refresh=${refresh_token}`);

        // res.redirect(`/#${
        //   querystring.stringify({
        //     access_token,
        //     refresh_token,
        //   })}`);
      } else {
        res.redirect(`/#${
          querystring.stringify({
            error: 'invalid_token',
          })}`);
      }
    });
  }
});
app.get('/refresh_token', (req, res) => {
  // requesting access token from refresh token
  const { refresh_token } = req.query;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${new Buffer(`${client_id}:${client_secret}`).toString('base64')}` },
    form: {
      grant_type: 'refresh_token',
      refresh_token,
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const { access_token } = body;
      res.send({
        access_token,
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Brace server is listening on port ${PORT}!`);
});
