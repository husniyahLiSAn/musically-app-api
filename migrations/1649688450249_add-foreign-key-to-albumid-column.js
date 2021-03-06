exports.up = (pgm) => {
  // membuat album baru.
  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('old_albums', 'old_albums', 1900)");

  // mengubah nilai album_id pada song yang album_id-nya bernilai NULL
  pgm.sql("UPDATE songs SET album_id = 'old_albums' WHERE album_id = NULL");

  // memberikan constraint foreign key pada album_id terhadap kolom id dari tabel songs
  pgm.addConstraint('songs', 'fk_albums.album_id_songs.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_albums.album_id_songs.id pada tabel albums
  pgm.dropConstraint('songs', 'fk_albums.album_id_songs.id');

  // mengubah nilai album_id old_albums pada song menjadi NULL
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_albums'");

  // menghapus album baru.
  pgm.sql("DELETE FROM albums WHERE id = 'old_albums'");
};
