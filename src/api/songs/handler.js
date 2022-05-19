class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler({ payload }, h) {
    this._validator.validateSongPayload(payload);
    const songId = await this._service.addSong(payload);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line consistent-return
  async getSongsHandler(request) {
    if (Object.getOwnPropertyNames(request.query).length === 1) {
      let songs = [];
      if (request.query.title !== undefined) {
        songs = await this._service.getSongByTitle(request.query.title);
      } else if (request.query.performer !== undefined) {
        songs = await this._service.getSongByPerformer(request.query.performer);
      }
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    }
    if (Object.getOwnPropertyNames(request.query).length === 2) {
      const songs = await this._service.getByFilter(request.query.title, request.query.performer);
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    }
    if (Object.getOwnPropertyNames(request.query).length === 0) {
      const songs = await this._service.getSongs();
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    }
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const {
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    } = request.payload;
    const { id } = request.params;

    await this._service.editSongById(id, {
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    });

    return {
      status: 'success',
      message: 'Data lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
