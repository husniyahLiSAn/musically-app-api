class Handler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
    this.postAlbumLikesByIdHandler = this.postAlbumLikesByIdHandler.bind(this);
    this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);
  }

  async postAlbumHandler({ payload }, h) {
    this._validator.validateAlbumPayload(payload);

    const albumId = await this._service.addAlbum(payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const album = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getAlbumWithSongsById(id);
    if (album.cover === null) {
      return {
        status: 'success',
        data: {
          album: {
            id: album.id,
            name: album.name,
            year: album.year,
            coverUrl: null,
            songs,
          },
        },
      };
    }
    return {
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          coverUrl: `http://${process.env.HOST}:${process.env.PORT}/album/images/${album.cover}`,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Data Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    await this._service.addCoverById(id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyIdAlbum(id);

    const check = await this._service.postLikeAlbumById({ id, owner: credentialId });
    if (check) {
      const response = h.response({
        status: 'success',
        message: 'Like Album',
      });
      response.code(201);
      return response;
    }
    const response = h.response({
      status: 'success',
      message: 'Unlike Album',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.verifyIdAlbum(id);

    const check = await this._service.getHeaderLikesAlbumById(id);
    const likes = await this._service.getLikesAlbumById(id);
    if (check) {
      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.header('X-Data-Source', 'cache');
      response.code(200);
      return response;
    }
    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }
}

module.exports = Handler;
