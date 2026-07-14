const db = require("../config/db");

// ==========================================
// GET DATA PENILAIAN
// ==========================================

exports.getPenilaian = (req, res) => {
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

            IFNULL(p.nilai,'-') nilai,
            IFNULL(p.grade,'-') grade,
            IFNULL(p.catatan,'') catatan,

            (
                SELECT COUNT(*)
                FROM kehadiran k
                WHERE k.mahasiswa_id = m.id
                AND k.status='hadir'
            ) total_hadir,

            (
                SELECT COUNT(*)
                FROM aktivitas a
                WHERE a.mahasiswa_id=m.id
            ) total_aktivitas,

            CASE

                WHEN p.id IS NULL
                THEN 'Belum Dinilai'

                ELSE 'Sudah Dinilai'

            END status

        FROM mahasiswa m

        LEFT JOIN divisi d
            ON d.id=m.divisi_id

        LEFT JOIN penilaian p
            ON p.mahasiswa_id=m.id

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

                OR

                m.nim LIKE ?

            )

        `;

    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  // ==========================
  // FILTER DIVISI
  // ==========================

  if (divisi !== "") {
    sql += `
            AND m.divisi_id = ?
        `;

    params.push(divisi);
  }

  // ==========================
  // FILTER STATUS
  // ==========================

  if (status !== "") {
    if (status === "sudah") {
      sql += `
                AND p.id IS NOT NULL
            `;
    }

    if (status === "belum") {
      sql += `
                AND p.id IS NULL
            `;
    }
  }

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
// DETAIL MAHASASISWA
// ==========================================

exports.getDetailPenilaian = (req, res) => {
  const id = req.params.id;

  db.query(
    `
        SELECT

            m.id,
            m.nim,
            m.nama,
            m.prodi,
            m.foto,

            d.nama_divisi,

            IFNULL(p.nilai,'') nilai,
            IFNULL(p.grade,'') grade,
            IFNULL(p.catatan,'') catatan,

            (
                SELECT COUNT(*)
                FROM kehadiran
                WHERE mahasiswa_id=m.id
                AND status='hadir'
            ) total_hadir,

            (
                SELECT COUNT(*)
                FROM aktivitas
                WHERE mahasiswa_id=m.id
            ) total_aktivitas

        FROM mahasiswa m

        LEFT JOIN divisi d
            ON d.id=m.divisi_id

        LEFT JOIN penilaian p
            ON p.mahasiswa_id=m.id

        WHERE m.id=?

        LIMIT 1
    `,
    [id],
    (err, rows) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Database Error",
        });
      }

      if (rows.length == 0) {
        return res.status(404).json({
          message: "Mahasiswa tidak ditemukan",
        });
      }

      res.json(rows[0]);
    },
  );
};

// ==========================================
// SIMPAN PENILAIAN
// ==========================================

exports.simpanPenilaian = (req, res) => {
  const { mahasiswa_id, nilai, catatan } = req.body;

  if (!mahasiswa_id || nilai === "") {
    return res.status(400).json({
      message: "Data belum lengkap",
    });
  }

  let grade = "E";

  if (nilai >= 85) grade = "A";
  else if (nilai >= 70) grade = "B";
  else if (nilai >= 55) grade = "C";
  else if (nilai >= 40) grade = "D";

  db.query(
    `
        SELECT id
        FROM penilaian
        WHERE mahasiswa_id=?
    `,
    [mahasiswa_id],
    (err, rows) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Database Error",
        });
      }

      // ======================================
      // UPDATE
      // ======================================

      if (rows.length > 0) {
        db.query(
          `
                UPDATE penilaian

                SET

                    nilai=?,
                    grade=?,
                    catatan=?

                WHERE mahasiswa_id=?
            `,
          [nilai, grade, catatan, mahasiswa_id],
          (err2) => {
            if (err2) {
              console.log(err2);

              return res.status(500).json({
                message: "Gagal update penilaian",
              });
            }

            return res.json({
              success: true,
              message: "Penilaian berhasil diperbarui",
            });
          },
        );
      }

      // ======================================
      // INSERT
      // ======================================
      else {
        db.query(
          `
                    INSERT INTO penilaian
                    (
                        mahasiswa_id,
                        nilai,
                        grade,
                        catatan
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?
                    )
                `,
          [mahasiswa_id, nilai, grade, catatan],
          (err3) => {
            if (err3) {
              console.log(err3);

              return res.status(500).json({
                message: "Gagal menyimpan penilaian",
              });
            }

            res.json({
              success: true,
              message: "Penilaian berhasil disimpan",
            });
          },
        );
      }
    },
  );
};

// ==========================================
// DASHBOARD PENILAIAN
// ==========================================

exports.getStatistik = (req, res) => {
  db.query(
    `

        SELECT

            COUNT(*) total_mahasiswa,

            SUM(
                CASE
                    WHEN p.id IS NOT NULL
                    THEN 1
                    ELSE 0
                END
            ) sudah_dinilai,

            SUM(
                CASE
                    WHEN p.id IS NULL
                    THEN 1
                    ELSE 0
                END
            ) belum_dinilai,

            ROUND(
                AVG(p.nilai),
                2
            ) rata_nilai

        FROM mahasiswa m

        LEFT JOIN penilaian p

        ON p.mahasiswa_id=m.id

        `,

    (err, rows) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Database Error",
        });
      }

      res.json(rows[0]);
    },
  );
};
