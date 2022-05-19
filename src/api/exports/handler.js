class ExportsHandler {
  constructor(service, playlistsService, playlistSongsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this.playlistSongsService = playlistSongsService;
    this._validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.playlistSongsService.verifyIdPlaylist(id);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const message = {
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
