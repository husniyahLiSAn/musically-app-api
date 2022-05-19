const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler, // hanya menerima dan menyimpan "satu" album.
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postUploadCoverHandler, // upload cover album
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postAlbumLikesByIdHandler, // like or unlike album
    options: {
      auth: 'musicbanksapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums',
    handler: handler.getAlbumsHandler, // getAlbumsHandler mengembalikan "banyak" album.
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler, // return "satu" album beserta lagunya.
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikesByIdHandler, // return album like count.
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler, // hanya menerima dan mengubah "satu" album.
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler, // deleteAlbumByIdHandler untuk menghapus "satu" album.
  },
  {
    method: 'GET',
    path: '/album/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = routes;
