const db = require("../config/db");

// =============================
// Dashboard Mahasiswa
// =============================
exports.dashboard = (req, res) => {
  const mahasiswaId = req.user.mahasiswa_id;

  if (!mahasiswaId) {
    return res.status(400).json({
      message: "Mahasiswa tidak ditemukan",
    });
  }

  const data = {};

  // =============================
  // Status Hari Ini
  // =============================
  db.query(
    `
    SELECT status
    FROM kehadiran
    WHERE mahasiswa_id=?
    AND tanggal=CURDATE()
    LIMIT 1
    `,
    [mahasiswaId],
    (err, hadir) => {
      if (err) return res.status(500).json(err);

      data.status = hadir.length ? hadir[0].status : "Belum Absen";

      // =============================
      // Aktivitas Bulan Ini
      // =============================
      db.query(
        `
        SELECT COUNT(*) total
        FROM aktivitas
        WHERE mahasiswa_id=?
        AND MONTH(tanggal)=MONTH(CURDATE())
        AND YEAR(tanggal)=YEAR(CURDATE())
        `,
        [mahasiswaId],
        (err, aktivitas) => {
          if (err) return res.status(500).json(err);

          data.aktivitas = aktivitas[0].total;

          // =============================
          // Total Kehadiran
          // =============================
          db.query(
            `
            SELECT COUNT(*) total
            FROM kehadiran
            WHERE mahasiswa_id=?
            `,
            [mahasiswaId],
            (err, total) => {
              if (err) return res.status(500).json(err);

              data.total_absen = total[0].total;

              // =============================
              // Persentase
              // =============================
              db.query(
                `
                SELECT
                COUNT(*) hadir
                FROM kehadiran
                WHERE mahasiswa_id=?
                AND status='hadir'
                `,
                [mahasiswaId],
                (err, hadirTotal) => {
                  if (err) return res.status(500).json(err);

                  const hadir = hadirTotal[0].hadir;

                  data.persentase = data.total_absen == 0 ? 0 : Math.round((hadir / data.total_absen) * 100);

                  // =============================
                  // Grafik Mingguan
                  // =============================
                  db.query(
                    `
                    SELECT
                      DAYNAME(tanggal) hari,
                      COUNT(*) jumlah
                    FROM kehadiran
                    WHERE mahasiswa_id=?
                    GROUP BY DAYNAME(tanggal)
                    `,
                    [mahasiswaId],
                    (err, grafik) => {
                      if (err) return res.status(500).json(err);

                      data.grafik = grafik;

                      res.json(data);
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
};
