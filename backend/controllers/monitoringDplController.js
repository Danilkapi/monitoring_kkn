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
        AND k.tanggal = CURRENT_DATE

    WHERE 1=1
  `;

  const params = [];

  // ==========================
  // SEARCH
  // ==========================

  if (search !== "") {
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    sql += `
      AND (
          m.nama LIKE $${params.length - 1}
          OR m.nim LIKE $${params.length}
      )
    `;
  }

  // ==========================
  // DIVISI
  // ==========================

  if (divisi !== "") {
    params.push(divisi);
    sql += `
      AND m.divisi_id = $${params.length}
    `;
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
      params.push(status);
      sql += `
        AND k.status = $${params.length}
      `;
    }
  }

  // ==========================

  sql += `
      ORDER BY m.nama ASC
  `;

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: "Database Error",
      });
    }

    res.json(result.rows);
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
        AND k.tanggal=CURRENT_DATE

    WHERE m.id=$1

    LIMIT 1
    `,

    [id],

    (err, result) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          success: false,
          message: "Database Error",
        });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Mahasiswa tidak ditemukan",
        });
      }

      res.json(result.rows[0]);
    },
  );
};
