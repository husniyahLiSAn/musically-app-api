const mapDBToModelAlbum = ({
  id, name, year,
}) => ({
  id, name, year,
});

const mapDBToModelSong = ({
  id, title, performer,
}) => ({
  id, title, performer,
});

const mapDBToModelSongById = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapDBToModelPlaylist = ({
  id, name, username,
}) => ({
  id, name, username,
});

const mapDBToModelPlaylistActivity = ({
  username, title, action, time,
}) => ({
  username, title, action, time,
});

module.exports = {
  mapDBToModelAlbum,
  mapDBToModelSong,
  mapDBToModelSongById,
  mapDBToModelPlaylist,
  mapDBToModelPlaylistActivity,
};
