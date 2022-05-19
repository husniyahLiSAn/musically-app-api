exports.up = (pgm) => {
  // menambahkan  column cover pada tabel albums
  pgm.sql('ALTER TABLE albums ADD COLUMN cover text NULL');
};

exports.down = (pgm) => {
  // menghapus  column cover pada tabel albums
  pgm.sql('ALTER TABLE albums DROP COLUMN cover');
};
