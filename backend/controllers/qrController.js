const db = require("../config/db");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// =====================================
// HITUNG JARAK GPS (Meter)
// =====================================
function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// =====================================
// GENERATE QR
// =====================================
exports.generateQR = async (req, res) => {
  try {
    // Nonaktifkan QR lama
    db.query("UPDATE qr_code SET status='expired' WHERE status='aktif'");

    const kode = uuidv4();

    const tanggal = new Date().toISOString().slice(0, 10);

    const expired = new Date();
    expired.setMinutes(expired.getMinutes() + 5);

    db.query(
      `
      INSERT INTO qr_code
      (
        kode,
        tanggal,
        expired_at,
        status
      )
      VALUES
      (
        ?,
        ?,
        ?,
        'aktif'
      )
      `,
      [kode, tanggal, expired],
      async (err) => {
        if (err) return res.status(500).json(err);

        const qr = await QRCode.toDataURL(kode);

        res.json({
          message: "QR Code berhasil dibuat",
          kode,
          expired_at: expired,
          qr,
        });
      },
    );
  } catch (err) {
    res.status(500).json(err);
  }
};

// =====================================
// QR TERBARU
// =====================================
exports.getLatestQR = (req, res) => {
  db.query(
    `
    SELECT *
    FROM qr_code
    WHERE status='aktif'
    ORDER BY id DESC
    LIMIT 1
    `,
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.json({
          message: "Belum ada QR aktif",
        });
      }

      const qr = await QRCode.toDataURL(result[0].kode);

      res.json({
        ...result[0],
        qr,
      });
    },
  );
};

// =====================================
// SCAN QR
// =====================================
exports.scanQR = (req, res) => {
  const { kode, latitude, longitude } = req.body;

  const mahasiswaId = req.user.mahasiswa_id;
  if (!mahasiswaId) {
    return res.status(403).json({
      message: "Akun ini belum terhubung dengan data mahasiswa.",
    });
  }

  db.query(
    `
    SELECT *
    FROM qr_code
    WHERE kode=?
    AND status='aktif'
    `,
    [kode],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(400).json({
          message: "QR tidak valid",
        });
      }

      const qr = result[0];

      // QR Expired
      if (new Date() > new Date(qr.expired_at)) {
        db.query("UPDATE qr_code SET status='expired' WHERE id=?", [qr.id]);

        return res.status(400).json({
          message: "QR sudah expired",
        });
      }

      // Ambil lokasi KKN
      db.query(
        `
        SELECT *
        FROM lokasi_kkn
        LIMIT 1
        `,
        (err, lokasiResult) => {
          if (err) return res.status(500).json(err);

          if (lokasiResult.length === 0) {
            return res.status(400).json({
              message: "Lokasi KKN belum diatur.",
            });
          }

          const lokasi = lokasiResult[0];

          const jarak = hitungJarak(parseFloat(latitude), parseFloat(longitude), parseFloat(lokasi.latitude), parseFloat(lokasi.longitude));

          if (jarak > lokasi.radius) {
            return res.status(400).json({
              message: `Anda berada ${Math.round(jarak)} meter dari lokasi KKN.`,
            });
          }

          // Sudah absen?
          db.query(
            `
            SELECT *
            FROM kehadiran
            WHERE mahasiswa_id=?
            AND tanggal=CURDATE()
            `,
            [mahasiswaId],
            (err, cek) => {
              if (err) return res.status(500).json(err);

              if (cek.length > 0) {
                return res.status(400).json({
                  message: "Anda sudah melakukan absensi hari ini.",
                });
              }

              // Status hadir / terlambat
              const sekarang = new Date();

              let status = "hadir";

              if (sekarang.getHours() > 8 || (sekarang.getHours() === 8 && sekarang.getMinutes() > 0)) {
                status = "terlambat";
              }

              // Simpan
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
                  ?
                )
                `,
                [mahasiswaId, latitude, longitude, status],
                (err) => {
                  if (err) return res.status(500).json(err);

                  res.json({
                    success: true,
                    message: "Absensi berhasil",
                    status,
                    jarak: Math.round(jarak),
                  });
                },
              );
            },
          );
        },
      );
    },
  );
};
