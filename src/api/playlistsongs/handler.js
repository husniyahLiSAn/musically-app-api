class PlaylistSongsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    // Songs in the Playlist
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.deleteSongInPlaylistByIdHandler = this.deleteSongInPlaylistByIdHandler.bind(this);

    // Get Playlist Activities
    this.getPlaylistActivitiesByIdHandler = this.getPlaylistActivitiesByIdHandler.bind(this);
  }

  // List methods of Playlist's Song
  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._service.verifyIdPlaylist(id);
    await this._service.verifyIdSong(songId);
    await this._service.addSongIntoPlaylist({ id, songId, owner: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke dalam playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._service.getPlaylistById(id);
    const songs = await this._service.getPlaylistSongsById(id);
    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist[0].id,
          name: playlist[0].name,
          username: playlist[0].username,
          songs,
        },
      },
    };
  }

  async deleteSongInPlaylistByIdHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._service.verifyIdPlaylist(id);
    await this._service.verifyIdSong(songId);
    await this._service.deleteSongInPlaylistById({ id, songId, owner: credentialId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  // Get Playlist Activities
  async getPlaylistActivitiesByIdHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const activities = await this._service.getPlaylistActivitiesById(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistSongsHandler;
