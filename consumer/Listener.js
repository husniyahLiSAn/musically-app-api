class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { userId, targetEmail } = JSON.parse(message.content.toString());

      const playlists = await this._playlistsService.getPlaylists(userId);
      const songs = await this._playlistsService.getPlaylistSongsById(playlists[0].id);
      const playlist = {
        playlist: {
          id: playlists[0].id,
          name: playlists[0].name,
          songs,
        },
      };
      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(playlist));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
