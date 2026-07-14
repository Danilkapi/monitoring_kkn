const db = require("../config/db");

/* ==========================================================
   GET LAPORAN
========================================================== */

exports.getLaporan = (req, res) => {
  const {
    jenis,

    divisi,

    mahasiswa,

    tanggal_awal,

    tanggal_akhir,
  } = req.query;

  switch (jenis) {
    case "absensi":
      return laporanAbsensi(req, res, divisi, mahasiswa, tanggal_awal, tanggal_akhir);

    case "aktivitas":
      return laporanAktivitas(req, res, divisi, mahasiswa, tanggal_awal, tanggal_akhir);

    case "mahasiswa":
      return laporanMahasiswa(req, res, divisi);

    case "divisi":
      return laporanDivisi(req, res);

    default:
      return res.status(400).json({
        success: false,

        message: "Jenis laporan tidak dikenali.",
      });
  }
};

/* ==========================================================
   MEMBANGUN FILTER SQL
========================================================== */

function buildFilter(
  divisi,

  mahasiswa,

  tanggal_awal,

  tanggal_akhir,

  alias = "m",
) {
  let where = [];

  let values = [];

  // ===========================
  // Filter Divisi
  // ===========================

  if (divisi) {
    where.push(`${alias}.divisi_id = ?`);

    values.push(divisi);
  }

  // ===========================
  // Filter Mahasiswa
  // ===========================

  if (mahasiswa) {
    where.push(`${alias}.id = ?`);

    values.push(mahasiswa);
  }

  return {
    where,

    values,
  };
}
/* ==========================================================
   FILTER TANGGAL
========================================================== */

function buildTanggal(
  tanggal_awal,

  tanggal_akhir,

  alias,
) {
  let where = [];

  let values = [];

  if (tanggal_awal) {
    where.push(`${alias}.tanggal >= ?`);

    values.push(tanggal_awal);
  }

  if (tanggal_akhir) {
    where.push(`${alias}.tanggal <= ?`);

    values.push(tanggal_akhir);
  }

  return {
    where,

    values,
  };
}

/* ==========================================================
   LAPORAN ABSENSI
========================================================== */

function laporanAbsensi(req, res, divisi, mahasiswa, tanggal_awal, tanggal_akhir) {
  const filter = buildFilter(divisi, mahasiswa, tanggal_awal, tanggal_akhir, "m");

  const filterTanggal = buildTanggal(tanggal_awal, tanggal_akhir, "k");

  let where = [...filter.where, ...filterTanggal.where];

  let values = [...filter.values, ...filterTanggal.values];

  let sql = `
        SELECT

            k.id,

            k.tanggal,

            k.jam_masuk,

            k.latitude,

            k.longitude,

            k.status,

            m.id AS mahasiswa_id,

            m.nama AS nama_mahasiswa,

            m.nim,

            m.prodi,

            d.id AS divisi_id,

            d.nama_divisi

        FROM kehadiran k

        INNER JOIN mahasiswa m
            ON k.mahasiswa_id = m.id

        INNER JOIN divisi d
            ON m.divisi_id = d.id
    `;

  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }

  sql += `
        ORDER BY

            k.tanggal DESC,

            k.jam_masuk DESC
    `;

  db.query(
    sql,

    values,

    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,

          message: err.message,
        });
      }

      res.json({
        success: true,

        total: result.length,

        data: result,
      });
    },
  );
}

/* ==========================================================
   LAPORAN AKTIVITAS
========================================================== */

function laporanAktivitas(req, res, divisi, mahasiswa, tanggal_awal, tanggal_akhir) {
  const filter = buildFilter(divisi, mahasiswa, tanggal_awal, tanggal_akhir, "m");

  const filterTanggal = buildTanggal(tanggal_awal, tanggal_akhir, "a");

  let where = [...filter.where, ...filterTanggal.where];

  let values = [...filter.values, ...filterTanggal.values];

  let sql = `
        SELECT

            a.id,

            a.judul_kegiatan,

            a.deskripsi,

            a.tanggal,

            a.foto,

            m.id AS mahasiswa_id,

            m.nama AS nama_mahasiswa,

            m.nim,

            m.prodi,

            d.id AS divisi_id,

            d.nama_divisi

        FROM aktivitas a

        INNER JOIN mahasiswa m
            ON a.mahasiswa_id = m.id

        INNER JOIN divisi d
            ON m.divisi_id = d.id
    `;

  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }

  sql += `
        ORDER BY
            a.tanggal DESC,
            a.id DESC
    `;

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,

        message: err.message,
      });
    }

    res.json({
      success: true,

      total: result.length,

      data: result,
    });
  });
}

/* ==========================================================
   LAPORAN MAHASISWA
========================================================== */

function laporanMahasiswa(req, res, divisi) {
  let sql = `
        SELECT

            m.id,

            m.nim,

            m.nama,

            m.prodi,

            m.no_hp,

            m.jabatan,

            d.id AS divisi_id,

            d.nama_divisi

        FROM mahasiswa m

        INNER JOIN divisi d
            ON m.divisi_id = d.id
    `;

  let values = [];

  if (divisi) {
    sql += " WHERE m.divisi_id=?";

    values.push(divisi);
  }

  sql += `
        ORDER BY

            m.nama ASC
    `;

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,

        message: err.message,
      });
    }

    res.json({
      success: true,

      total: result.length,

      data: result,
    });
  });
}

/* ==========================================================
   LAPORAN DIVISI
========================================================== */

function laporanDivisi(req, res) {
  const sql = `
        SELECT

            d.id,

            d.nama_divisi,

            d.deskripsi,

            COUNT(m.id) AS total_mahasiswa

        FROM divisi d

        LEFT JOIN mahasiswa m
            ON d.id = m.divisi_id

        GROUP BY

            d.id,

            d.nama_divisi,

            d.deskripsi

        ORDER BY

            d.nama_divisi ASC
    `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,

        message: err.message,
      });
    }

    res.json({
      success: true,

      total: result.length,

      data: result,
    });
  });
}
