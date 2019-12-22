const axios = require('axios');


module.exports = {
  baseUrl: 'https://api.spotify.com/',
  createAxios: (accessToken) => axios.create({
    baseURL: 'https://api.spotify.com/',
    headers: { Authorization: `Bearer ${accessToken}` },
  }),

  generateRandomString: (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
  getCurrentlyPlayingTrack: async (accessToken) => {
    const axios = this.createAxios(accessToken);

    const response = await axios.get('v1/me/player/currently-playing/')
      .then((res) => res);
  },
};
