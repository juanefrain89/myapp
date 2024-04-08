const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require("mysql");
const mysqlConexion = require("express-myconnection");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173"
}));

const dbConfig = {
  host: "35.188.45.172",
  user: "root",
  password: "V18135w00*",
  database: "juan"
};





const connection = mysql.createConnection(dbConfig);
connection.connect(err => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos");
});



app.use(mysqlConexion(mysql, dbConfig, "single"));


app.use(mysqlConexion(mysql, dbConfig, "single"));


app.post("/login", (req, res) => {

  const  {correo}  = req.body;
  const  {password}  = req.body;
  
    console.log("Correo recibido:", correo);
    try {
      const query = `SELECT * FROM usuarios_roles WHERE correo = '${correo}' and password ='${password}' `;
  
      console.log(query);
      req.getConnection((err, con) => {
        if (err) {
       console.error("Error al conectar a la base de datos:", err);
          res.status(500).send("Error al conectar a la base de datos");
          return;
        }
  
        con.query(query, (err, result) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err);
            res.status(500).send("Error al ejecutar la consulta en la base de datos");
            return;
          }
        
          if (result.length === 0) {
            console.log("no encontrado");
          } else {
            const id = result[0].id;
            const rol = result[0].rol;
            const token = jwt.sign({ correo: correo }, "el botas", {expiresIn:"10m"}); // Corregido aquí
            console.log(id);
            res.status(200).json({token, id,rol});
            console.log("correcto");
          }
        });
      });
    } catch (error) {
      console.error("Error en el servidor:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });
  


app.post("/datos", (req, res) => {
  const { id } = req.body;
  console.log("ID recibido:", id);
  const query = `SELECT * FROM clientesdentistas WHERE id_dentista = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).send("Error al ejecutar la consulta en la base de datos");
      return;
    }
    if (result.length === 0) {
      console.log("No se encontraron datos");
      res.status(404).send("No se encontraron datos");
    } else {
      res.status(200).json(result);
    }
  });
});

app.post("/eliminardatos", (req, res) => {
  const { id } = req.body;
  const query = `DELETE FROM clientesdentistas WHERE id_personal = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).send("Error al ejecutar la consulta en la base de datos");
      return;
    }
    if (result.affectedRows === 0) {
      console.log("No se encontraron datos para eliminar");
      res.status(404).send("No se encontraron datos para eliminar");
    } else {
      res.status(200).send("Datos eliminados correctamente");
    }
  });
});

app.post("/modificardatos", (req, res) => {
  const { id, correo, tratamiento, numero } = req.body;
  const query = `UPDATE clientesdentistas SET correo = '${correo}', tratamiento = '${tratamiento}', numero = '${numero}' WHERE id_personal = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).send("Error al ejecutar la consulta en la base de datos");
      return;
    }
    if (result.affectedRows === 0) {
      console.log("No se encontraron datos para modificar");
      res.status(404).send("No se encontraron datos para modificar");
    } else {
      res.status(200).send("Datos modificados correctamente");
    }
  });
});

app.post("/registrar", (req, res) => {
  const { password, correo, tratamiento, numero } = req.body;
  const query = `INSERT INTO clientesdentistas (id_dentista, correo, tratamiento, numero, password) VALUES (1, '${correo}', '${tratamiento}', '${numero}', '${password}')`;
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).send("Error al ejecutar la consulta en la base de datos");
      return;
    }
    res.status(200).send("Datos registrados correctamente");
  });
});

app.post("/user", (req, res) => {
  const { id } = req.body;
  const query = `SELECT * FROM usuarios_roles WHERE id = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).send("Error al ejecutar la consulta en la base de datos");
      return;
    }
    if (result.length === 0) {
      console.log("No se encontraron datos");
      res.status(404).send("No se encontraron datos");
    } else {
      res.status(200).json(result);
    }
  });
});

app.post("/userdatos", (req, res) => {
  const { id, correo, password } = req.body;
  const query = `UPDATE usuarios_roles SET correo = '${correo}', password = '${password}' WHERE id = '${id}'`;
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).send("Error al ejecutar la consulta en la base de datos");
      return;
    }
    if (result.affectedRows === 0) {
      console.log("No se encontraron datos para modificar");
      res.status(404).send("No se encontraron datos para modificar");
    } else {
      res.status(200).send("Datos de usuario modificados correctamente");
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
