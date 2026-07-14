const db = require("../config/db");

exports.getMonitoring = (req, res) => {
  const search = req.query.search || "";
  const divisi = req.query.divisi || "";
  const status = req.query.status || "";

  let sql = `
    SELECT
        m.id,
        m.nim,
        m.nama,
        m.prodi,
        m.foto,

        d.id AS divisi_id,
        d.nama_divisi,

        k.id AS kehadiran_id,
        k.status,
        k.jam_masuk,
        k.latitude,
        k.longitude,

        (
            SELECT a.judul_kegiatan
            FROM aktivitas a
            WHERE a.mahasiswa_id = m.id
            ORDER BY a.created_at DESC
            LIMIT 1
        ) AS aktivitas

    FROM mahasiswa m

    LEFT JOIN divisi d
        ON d.id = m.divisi_id

    LEFT JOIN kehadiran k
        ON k.mahasiswa_id = m.id
        AND k.tanggal = CURDATE()

    WHERE 1=1
  `;

  const params = [];

  // ==========================
  // SEARCH
  // ==========================

  if (search !== "") {
    sql += `
      AND (
          m.nama LIKE ?
          OR m.nim LIKE ?
      )
    `;

    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  // ==========================
  // DIVISI
  // ==========================

  if (divisi !== "") {
    sql += `
      AND m.divisi_id = ?
    `;

    params.push(divisi);
  }

  // ==========================
  // STATUS
  // ==========================

  if (status !== "") {
    if (status === "tidak_hadir") {
      sql += `
        AND k.id IS NULL
      `;
    } else {
      sql += `
        AND k.status = ?
      `;

      params.push(status);
    }
  }

  // ==========================

  sql += `
      ORDER BY m.nama ASC
  `;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: "Database Error",
      });
    }

    res.json(rows);
  });
};

// ==========================================
// DETAIL MAHASISWA
// ==========================================

exports.getDetailMahasiswa = (req, res) => {
  const id = req.params.id;

  db.query(
    `
    SELECT

        m.*,

        d.nama_divisi,

        k.status,
        k.jam_masuk,
        k.latitude,
        k.longitude,

        (
            SELECT judul_kegiatan
            FROM aktivitas
            WHERE mahasiswa_id=m.id
            ORDER BY created_at DESC
            LIMIT 1
        ) aktivitas

    FROM mahasiswa m

    LEFT JOIN divisi d
        ON d.id=m.divisi_id

    LEFT JOIN kehadiran k
        ON k.mahasiswa_id=m.id
        AND k.tanggal=CURDATE()

    WHERE m.id=?

    LIMIT 1
    `,

    [id],

    (err, rows) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          success: false,
          message: "Database Error",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Mahasiswa tidak ditemukan",
        });
      }

      res.json(rows[0]);
    },
  );
};
