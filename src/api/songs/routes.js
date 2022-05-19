const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler, // postSongHandler hanya menerima dan menyimpan "satu" lagu.
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler, // getSongsHandler mengembalikan "banyak" lagu.
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler, // getSongByIdHandler mengembalikan "satu" data lagu.
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler, // hanya menerima dan mengubah "satu" data lagu.
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler, // deleteSongByIdHandler untuk menghapus "satu" lagu.
  },
];

module.exports = routes;
