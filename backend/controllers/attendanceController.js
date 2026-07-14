const db = require("../config/db");

exports.createAttendance = (req, res) => {
  const { mahasiswa_id, tanggal, jam_masuk, latitude, longitude, status } = req.body;

  db.query(
    `
    INSERT INTO kehadiran
    (
      mahasiswa_id,
      tanggal,
      jam_masuk,
      latitude,
      longitude,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [mahasiswa_id, tanggal, jam_masuk, latitude, longitude, status],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Absensi berhasil",
      });
    },
  );
};

exports.getAllAttendance = (req, res) => {
  db.query(
    `
    SELECT
      k.*,
      m.nama,
      m.nim
    FROM kehadiran k
    JOIN mahasiswa m
      ON k.mahasiswa_id = m.id
    `,
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    },
  );
};

exports.getAttendanceByMahasiswa = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    SELECT *
    FROM kehadiran
    WHERE mahasiswa_id = ?
    `,
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    },
  );
};

const geolib = require("geolib");

exports.scanAttendance = (req, res) => {
  const { mahasiswa_id, token, latitude, longitude } = req.body;

  db.query(
    `
    SELECT *
    FROM qr_sessions
    WHERE token = ?
    `,
    [token],
    (err, qrResult) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (qrResult.length === 0) {
        return res.status(404).json({
          message: "QR Code tidak valid",
        });
      }

      const qr = qrResult[0];

      if (new Date(qr.expired_at) < new Date()) {
        return res.status(400).json({
          message: "QR Code sudah expired",
        });
      }

      const distance = geolib.getDistance(
        {
          latitude,
          longitude,
        },
        {
          latitude: -3.31722,
          longitude: 114.59023,
        },
      );

      if (distance > 100) {
        return res.status(400).json({
          message: "Anda berada di luar area posko",
        });
      }

      db.query(
        `
        INSERT INTO kehadiran
        (
          mahasiswa_id,
          tanggal,
          jam_masuk,
          latitude,
          longitude,
          status
        )
        VALUES
        (
          ?,
          CURDATE(),
          CURTIME(),
          ?,
          ?,
          'hadir'
        )
        `,
        [mahasiswa_id, latitude, longitude],
        (err) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.json({
            message: "Absensi berhasil",
          });
        },
      );
    },
  );
};
