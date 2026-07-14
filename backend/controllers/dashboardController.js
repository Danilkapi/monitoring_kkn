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

            res.json({
              total_mahasiswa: mahasiswaResult.rows[0].total_mahasiswa,

              total_divisi: divisiResult.rows[0].total_divisi,

              total_kehadiran: kehadiranResult.rows[0].total_kehadiran,

              total_aktivitas: aktivitasResult.rows[0].total_aktivitas,
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
