const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require("mysql");
const mysqlConexion = require("express-myconnection");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173"
}));

const dbConfig = {
  host: "198.59.144.133",
  user: "mavahost_juan",
  password: "juanito18*#.",
  database: "mavahost_omar"
};



app.use(mysqlConexion(mysql, dbConfig, "single"));

app.get("/", (req, res) => {
  const query = `SELECT * FROM patrullas`;
  
  try {
    req.getConnection((err, con) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return res.status(500).send("Error al conectar a la base de datos");
      }

      con.query(query, (err, result) => {
        if (err) {
          console.error("Error al ejecutar la consulta:", err);
          return res.status(500).send("Error al ejecutar la consulta en la base de datos");
        }
        
        if (result.length === 0) {
          console.log("No se encontraron resultados.");
          return res.status(404).send("No se encontraron resultados.");
        } else {
          res.status(200).send(result);
        }
      });
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error inesperado");
  }
});

app.post("/l", upload.single('imagen'), (req, res) => {
  const { placa, ubicacion, contacto, unidad, referencias, latitud, longitud } = req.body;
  const imagenBuffer = req.file ? req.file.buffer : null;

  console.log(req.body);

  const sql = 'INSERT INTO patrullas (ubicacion, contacto, unidad, referencias, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [ubicacion, contacto, unidad, referencias, imagenBuffer, latitud, longitud];

  req.getConnection((err, con) => {
    if (err) {
      console.error("Error de conexión a la base de datos:", err);
      return res.status(500).send('Error de conexión a la base de datos');
    }

    con.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos:", err);
        return res.status(500).send('Error al insertar en la base de datos');
      }
      res.status(200).send({ message: 'Registro exitoso', result });
    });
  });
});

app.listen(4200, () => {
  console.log("Server running on port 4200");
});
