const express = require("express");
const app = express();
const mysql = require("mysql");
const mysqlConexion = require("express-myconnection");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: "https://omar-7ebn.onrender.com"
}));

// Configuración de multer para almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imagenes"); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop(); // Obtiene la extensión del archivo
    cb(null, `${Date.now()}.${ext}`); // Asigna un nombre único basado en la fecha
  }
});

const upload = multer({ storage: storage });



const dbConfig = {
  host: "198.59.144.133",
  user: "mavahost_juan",
  password: "juanito18*#.",
  database: "mavahost_omar"
};


app.use(mysqlConexion(mysql, dbConfig, "single"));

// Ruta para servir imágenes estáticamente
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Ruta para obtener todas las patrullas
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
          
          const resultsWithUrls = result.map(item => ({
            ...item,
           
            imagen: item.imagen ? `https://omar-7ebn.onrender.com/imagenes/${item.imagen}` : null // Agregar la URL de la imagen
          }));
          res.status(200).send(resultsWithUrls);
        }
      });
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error inesperado");
  }
});

// Ruta para insertar datos en la base de datos
app.post("/l", upload.single('imagen'), (req, res) => {
  const { placa, ubicacion, contacto, unidad, referencias, latitud, longitud } = req.body;
  const imagenNombre = req.file ? req.file.filename : null; // Obtiene el nombre del archivo de la imagen

  const sql = 'INSERT INTO patrullas (placa, ubicacion, contacto, unidad, referencias, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [placa, ubicacion, contacto, unidad, referencias, imagenNombre, latitud, longitud];

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

      
      const imagenUrl = imagenNombre ? `http://localhost:4200/imagenes/${imagenNombre}` : null;
      res.status(200).send({ message: 'Registro exitoso', id: result.insertId, imagen: imagenUrl });
    });
  });
});

app.listen(4200, () => {
  console.log("Server running on port 4200");
});
