const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModelPlaylist, mapDBToModelSong, mapDBToModelPlaylistActivity } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  // Verify
  async verifyIdPlaylist(id) {
    const query = {
      text: 'SELECT playlists.* FROM playlists WHERE id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async verifyIdSong(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

  // List methods of Playlist's Song
  async addSongIntoPlaylist({ id, songId, owner }) {
    const idPlaylistSong = `playlistsong-${nanoid(16)}`;
    const idActivity = `playlistactivities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [idPlaylistSong, id, songId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Gagal menambahkan Lagu ke dalam Playlist');
    } else {
      const searchSong = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [songId],
      };
      const result = await this._pool.query(searchSong);
      const activities = {
        text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
        values: [idActivity, id, result.rows[0].title, owner, 'add', time],
      };
      await this._pool.query(activities);
    }
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.*, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return rows.map(mapDBToModelPlaylist);
  }

  async getPlaylistSongsById(id) {
    const query = {
      text: `SELECT songs.* FROM playlists
      LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
      LEFT JOIN songs ON songs.id = playlist_songs.song_id
      WHERE playlists.id = $1`,
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    return rows.map(mapDBToModelSong);
  }

  async deleteSongInPlaylistById({ id, songId, owner }) {
    const idActivity = `playlistactivities-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
      values: [songId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    const searchSong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(searchSong);
    const activities = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [idActivity, id, result.rows[0].title, owner, 'delete', time],
    };

    await this._pool.query(activities);
  }

  // Get Playlist Activities
  async getPlaylistActivitiesById(id) {
    const query = {
      text: `SELECT users.username, playlist_song_activities.*, playlist_song_activities.song_id as title
      FROM playlist_song_activities
      LEFT JOIN playlists ON playlists.id = playlist_song_activities.playlist_id
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Aktifitas lagu tidak ditemukan');
    }

    return rows.map(mapDBToModelPlaylistActivity);
  }
}

module.exports = PlaylistSongsService;
