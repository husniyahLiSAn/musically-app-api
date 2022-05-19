const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, {
    service, playlistsService,
    playlistSongsService, validator,
  }) => {
    const exportsHandler = new ExportsHandler(
      service,
      playlistsService,
      playlistSongsService,
      validator,
    );
    server.route(routes(exportsHandler));
  },
};
