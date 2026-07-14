const db = require("../config/db");

exports.getDashboard = (req, res) => {
  const dashboard = {};

  // ======================================================
  // TOTAL MAHASISWA
  // ======================================================

  db.query("SELECT COUNT(*) total FROM mahasiswa", (err, mahasiswa) => {
    if (err) return res.status(500).json(err);

    dashboard.total_mahasiswa = mahasiswa.rows[0].total;

    // ======================================================
    // HADIR HARI INI
    // ======================================================

    db.query(
      `
      SELECT COUNT(*) total
      FROM kehadiran
      WHERE tanggal = CURRENT_DATE
      `,
      (err, hadir) => {
        if (err) return res.status(500).json(err);

        dashboard.hadir_hari_ini = hadir.rows[0].total;

        // ======================================================
        // AKTIVITAS HARI INI
        // ======================================================

        db.query(
          `
          SELECT COUNT(*) total
          FROM aktivitas
          WHERE tanggal = CURRENT_DATE
          `,
          (err, aktivitas) => {
            if (err) return res.status(500).json(err);

            dashboard.aktivitas_hari_ini = aktivitas.rows[0].total;

            // ======================================================
            // TOTAL DIVISI
            // ======================================================

            db.query(
              `
              SELECT COUNT(*) total
              FROM divisi
              `,
              (err, divisi) => {
                if (err) return res.status(500).json(err);

                dashboard.total_divisi = divisi.rows[0].total;

                // ======================================================
                // GRAFIK 7 HARI
                // ======================================================

                db.query(
                  `
                  SELECT
                    TO_CHAR(tanggal,'DD/MM') AS tanggal,
                    COUNT(*) AS total
                  FROM kehadiran
                  WHERE tanggal >= CURRENT_DATE - INTERVAL '6 days'
                  GROUP BY tanggal
                  ORDER BY tanggal ASC
                  `,
                  (err, grafik) => {
                    if (err) return res.status(500).json(err);

                    dashboard.grafik = grafik.rows;

                    // ======================================================
                    // 5 AKTIVITAS TERBARU
                    // ======================================================

                    db.query(
                      `
                      SELECT
                        m.nama,
                        a.judul_kegiatan,
                        a.tanggal
                      FROM aktivitas a
                      JOIN mahasiswa m
                        ON m.id=a.mahasiswa_id
                      ORDER BY a.created_at DESC
                      LIMIT 5
                      `,
                      (err, aktivitasTerbaru) => {
                        if (err) return res.status(500).json(err);

                        dashboard.aktivitas_terbaru = aktivitasTerbaru.rows;

                        // ======================================================
                        // BELUM ABSEN HARI INI
                        // ======================================================

                        db.query(
                          `
                          SELECT
                            m.nim,
                            m.nama,
                            m.prodi,
                            d.nama_divisi
                          FROM mahasiswa m

                          LEFT JOIN divisi d
                            ON d.id=m.divisi_id

                          LEFT JOIN kehadiran k
                            ON k.mahasiswa_id=m.id
                            AND k.tanggal=CURRENT_DATE

                          WHERE k.id IS NULL

                          LIMIT 10
                          `,
                          (err, belumAbsen) => {
                            if (err) return res.status(500).json(err);

                            dashboard.belum_absen = belumAbsen.rows;

                            res.json(dashboard);
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
      },
    );
  });
};
