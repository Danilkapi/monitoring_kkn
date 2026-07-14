const db = require("../config/db");

// ==========================
// Ambil Lokasi
// ==========================
exports.getLokasi = (req, res) => {
  db.query(
    `
    SELECT *
    FROM lokasi_kkn
    LIMIT 1
    `,
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.json({});
      }

      return res.json(result[0]);
    },
  );
};

// ==========================
// Simpan Lokasi
// ==========================
exports.saveLokasi = (req, res) => {
  let { nama_lokasi, latitude, longitude, radius } = req.body;

  // ==========================
  // Validasi
  // ==========================
  if (!nama_lokasi || latitude === undefined || longitude === undefined || radius === undefined) {
    return res.status(400).json({
      message: "Semua data lokasi wajib diisi.",
    });
  }

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  radius = parseFloat(radius);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      message: "Latitude atau Longitude tidak valid.",
    });
  }

  if (isNaN(radius) || radius <= 0) {
    return res.status(400).json({
      message: "Radius harus lebih dari 0 meter.",
    });
  }

  db.query(
    `
    SELECT *
    FROM lokasi_kkn
    LIMIT 1
    `,
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      // ==========================
      // INSERT
      // ==========================
      if (result.length === 0) {
        db.query(
          `
          INSERT INTO lokasi_kkn
          (
            nama_lokasi,
            latitude,
            longitude,
            radius
          )
          VALUES
          (
            ?,
            ?,
            ?,
            ?
          )
          `,
          [nama_lokasi, latitude, longitude, radius],
          (err) => {
            if (err) {
              return res.status(500).json(err);
            }

            return res.json({
              success: true,
              message: "Lokasi berhasil disimpan.",
            });
          },
        );
      }

      // ==========================
      // UPDATE
      // ==========================
      else {
        db.query(
          `
          UPDATE lokasi_kkn
          SET
            nama_lokasi = ?,
            latitude = ?,
            longitude = ?,
            radius = ?
          WHERE id = ?
          `,
          [nama_lokasi, latitude, longitude, radius, result[0].id],
          (err) => {
            if (err) {
              return res.status(500).json(err);
            }

            return res.json({
              success: true,
              message: "Lokasi berhasil diperbarui.",
            });
          },
        );
      }
    },
  );
};
