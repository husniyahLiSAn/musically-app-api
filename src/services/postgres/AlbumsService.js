const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModelAlbum, mapDBToModelSong } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  // Verify
  async verifyIdAlbum(id) {
    const query = {
      text: 'SELECT albums.* FROM albums WHERE id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getAlbums() {
    const { rows } = await this._pool.query('SELECT * FROM albums');
    return rows.map(mapDBToModelAlbum);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT a.* FROM albums a WHERE a.id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return rows[0];
  }

  async getAlbumWithSongsById(id) {
    const querySongs = {
      text: 'SELECT s.* FROM songs s WHERE s.album_id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(querySongs);

    return rows.map(mapDBToModelSong);
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui data album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addCoverById(id, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [filename, id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui data album');
    }
  }

  async postLikeAlbumById({ id, owner }) {
    const idLike = `likes-${nanoid(16)}`;
    const check = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 and user_id = $2',
      values: [id, owner],
    };
    const { rows } = await this._pool.query(check);

    if (rows.length) {
      const query = {
        text: 'DELETE FROM user_album_likes WHERE album_id = $1 and user_id = $2',
        values: [id, owner],
      };

      await this._pool.query(query);
      await this._cacheService.delete(`albums:${id}`);
      return false;
    }
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [idLike, owner, id],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`albums:${id}`);
    return true;
  }

  async getHeaderLikesAlbumById(id) {
    try {
      await this._cacheService.get(`albums:${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getLikesAlbumById(id) {
    try {
      // mendapatkan data dari cache
      const result = await this._cacheService.get(`albums:${id}`);
      return JSON.parse(result);
    } catch (error) {
      // bila gagal, diteruskan dengan mendapatkan data dari database
      const query = {
        text: 'SELECT COUNT(a.id) FROM user_album_likes a WHERE a.album_id = $1 GROUP BY a.album_id',
        values: [id],
      };

      const { rows } = await this._pool.query(query);
      const mappedResult = parseInt(rows[0].count, 10);

      // catatan akan disimpan pada cache sebelum fungsi getLikesAlbumById dikembalikan
      await this._cacheService.set(`albums:${id}`, JSON.stringify(mappedResult));

      return mappedResult;
    }
  }
}

module.exports = AlbumsService;
