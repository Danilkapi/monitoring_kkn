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
    WHERE mahasiswa_id=$1
    AND tanggal=CURRENT_DATE
    LIMIT 1
    `,
    [mahasiswaId],
    (err, hadir) => {
      if (err) return res.status(500).json(err);

      data.status = hadir.rows.length ? hadir.rows[0].status : "Belum Absen";

      // =============================
      // Aktivitas Bulan Ini
      // =============================
      db.query(
        `
        SELECT COUNT(*) total
        FROM aktivitas
        WHERE mahasiswa_id=$1
        AND EXTRACT(MONTH FROM tanggal)=EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM tanggal)=EXTRACT(YEAR FROM CURRENT_DATE)
        `,
        [mahasiswaId],
        (err, aktivitas) => {
          if (err) return res.status(500).json(err);

          data.aktivitas = aktivitas.rows[0].total;

          // =============================
          // Total Kehadiran
          // =============================
          db.query(
            `
            SELECT COUNT(*) total
            FROM kehadiran
            WHERE mahasiswa_id=$1
            `,
            [mahasiswaId],
            (err, total) => {
              if (err) return res.status(500).json(err);

              data.total_absen = total.rows[0].total;

              // =============================
              // Persentase
              // =============================
              db.query(
                `
                SELECT
                COUNT(*) hadir
                FROM kehadiran
                WHERE mahasiswa_id=$1
                AND status='hadir'
                `,
                [mahasiswaId],
                (err, hadirTotal) => {
                  if (err) return res.status(500).json(err);

                  const hadir = hadirTotal.rows[0].hadir;

                  data.persentase = data.total_absen == 0 ? 0 : Math.round((hadir / data.total_absen) * 100);

                  // =============================
                  // Grafik Mingguan
                  // =============================
                  db.query(
                    `
                    SELECT
                      TO_CHAR(tanggal, 'Day') hari,
                      COUNT(*) jumlah
                    FROM kehadiran
                    WHERE mahasiswa_id=$1
                    GROUP BY TO_CHAR(tanggal, 'Day'), EXTRACT(DOW FROM tanggal)
                    ORDER BY EXTRACT(DOW FROM tanggal)
                    `,
                    [mahasiswaId],
                    (err, grafik) => {
                      if (err) return res.status(500).json(err);

                      data.grafik = grafik.rows;

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
