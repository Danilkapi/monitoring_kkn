const db = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const queryMahasiswa = `
            SELECT COUNT(*) AS total_mahasiswa
            FROM mahasiswa
        `;

    const queryDivisi = `
            SELECT COUNT(*) AS total_divisi
            FROM divisi
        `;

    const queryKehadiran = `
            SELECT COUNT(*) AS total_kehadiran
            FROM kehadiran
            WHERE tanggal = CURRENT_DATE
        `;

    const queryAktivitas = `
            SELECT COUNT(*) AS total_aktivitas
            FROM aktivitas
            WHERE tanggal = CURRENT_DATE
        `;

    db.query(queryMahasiswa, (err, mahasiswaResult) => {
      if (err) return res.status(500).json(err);

      db.query(queryDivisi, (err, divisiResult) => {
        if (err) return res.status(500).json(err);

        db.query(queryKehadiran, (err, kehadiranResult) => {
          if (err) return res.status(500).json(err);

          db.query(queryAktivitas, (err, aktivitasResult) => {
            if (err) return res.status(500).json(err);

            // ======================================================
            // GRAFIK KEHADIRAN 7 HARI
            // ======================================================

            const queryGrafik = `
                SELECT
                    TO_CHAR(tanggal, 'DD/MM') AS tanggal,
                    COUNT(*) AS total
                FROM kehadiran
                WHERE tanggal >= CURRENT_DATE - INTERVAL '6 days'
                GROUP BY tanggal
                ORDER BY tanggal ASC
            `;

            db.query(queryGrafik, (err, grafikResult) => {
              if (err) return res.status(500).json(err);

              // ======================================================
              // AKTIVITAS TERBARU
              // ======================================================

              const queryAktivitasTerbaru = `
                SELECT
                    m.nama,
                    d.nama_divisi,
                    a.judul_kegiatan,
                    a.tanggal
                FROM aktivitas a
                JOIN mahasiswa m
                    ON m.id = a.mahasiswa_id
                LEFT JOIN divisi d
                    ON d.id = m.divisi_id
                ORDER BY a.created_at DESC
                LIMIT 5
              `;

              db.query(queryAktivitasTerbaru, (err, aktivitasTerbaruResult) => {
                if (err) return res.status(500).json(err);

                res.json({
                  total_mahasiswa: mahasiswaResult.rows[0].total_mahasiswa,

                  total_divisi: divisiResult.rows[0].total_divisi,

                  total_kehadiran: kehadiranResult.rows[0].total_kehadiran,

                  total_aktivitas: aktivitasResult.rows[0].total_aktivitas,

                  grafik: grafikResult.rows,

                  aktivitas_terbaru: aktivitasTerbaruResult.rows,
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
