const express = require("express");
const app = express();
const mysql = require("mysql");
const mysqlConexion = require("express-myconnection");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const FormData = require('form-data');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');

cloudinary.config({
  cloud_name: 'de8ixclml',
  api_key: '411843524515185',
  api_secret: 'Y8BUj_6jzO2HXJX10Pz9BZPhdW0',
});
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "razoj140@gmail.com", // tu correo
    pass: "pipmzycmxgjmlbqg",   // tu contraseña de aplicaciones de Google
  },
});

const CLIENT_ID = 'e8e3f38bda95552';
transporter.verify()
  .then(() => {
    console.log('All good, ready to send emails!');
  })
  .catch(err => {
    console.error('Error verifying the transporter:', err);
  });

async function main(correo,codigo) {
  try {
   
    const info = await transporter.sendMail({
      from: '"mava publicidad 👻" <razoj140@gmail.com>',
      to: `${correo}`,
      subject: "Hello ✔", 
      text: `${codigo}`, 
      html: `<b>${codigo}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}





app.use(cors({
  origin: " http://localhost:8081",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));



const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'imagenes', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});


const upload = multer({ storage: storage });


const dbConfig = {
  host: "198.59.144.133",
  user: "mavahost_juan",
  password: "juanito18*#.",
  database: "mavahost_mypp",
  acquireTimeout: 10000, 
  connectTimeout: 10000, 
  timeout: 10000        
};






function handleDisconnect() {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("Error al conectar:", err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("Conectado a la base de datos.");
    }
  });

  connection.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Conexión perdida, intentando reconectar...");
      handleDisconnect(); 
    } else {
      throw err;
    }
  });

  return connection;
}

const connection = handleDisconnect();
app.use(mysqlConexion(mysql, dbConfig, "pool"));


app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
app.get("/", (req, res) => {
  const query = `SELECT * FROM pueblo`;
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
                     imagen: item.imagen && !item.imagen.startsWith("https://ddcd-5.onrender.com/imagenes/")
              ? `https://ddcd-5.onrender.com/imagenes/${item.imagen}`
              : item.imagen 
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




app.get("/mostrar", (req, res) => {
  const query = `SELECT * FROM patrullas_pendientes`;
  
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
             imagen: item.imagen ? `https://ddcd-5.onrender.com/imagenes/${item.imagen}` : null 
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
app.post("/l", (req, res) => {
  console.log(req.body);

  const { placa, ubicacion, contacto, unidad, referencias, latitud, longitud, id, imagen } = req.body;
  const operacion = Number(req.body.operacion);
  console.log(ubicacion, placa, imagen, operacion);

  const sql = 'INSERT INTO patrullas (placa, ubicacion, contacto, unidad, referencias, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [placa, ubicacion, contacto, unidad, referencias, imagen, latitud, longitud];

  req.getConnection((err, con) => {
    if (err) {
      console.error("Error de conexión a la base de datos:", err);
      return res.status(500).send('Error de conexión a la base de datos');
    }

    con.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos:", err);
        return res.send(err);
      }     

      const sql2 = 'DELETE FROM patrullas_pendientes WHERE id = ?';
      con.query(sql2, [id], (err) => {
        if (err) {
          console.error("Error al borrar:", err);
          return res.send(err);
        }  

        res.status(200).send({ message: 'Registro exitoso', id: result.insertId, imagen });
      });
    });
  });
});






app.post("/registro", (req, res) => {
 console.log(req.body);
 
  const { correo, password, rol } = req.body;  
console.log(correo, password, rol );
const codigo = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
  const sql = 'INSERT INTO usuarios (correo, contraseña, rol, codigo) VALUES (?, ?, ?, ?)';
  const values = [correo, password, rol, codigo];

  req.getConnection((err, con) => {
    if (err) {
      console.error("Error de conexión a la base de datos:", err);
      return res.status(500).send('Error de conexión a la base de datos');
    }

    con.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos:", err);
        return res.status(500).send('Error al insertar en la base de datos');
      }else{
        main(correo, codigo).then(()=>{return res.send("se envio un codigo a tu correo")}).catch((e)=>{
       return   res.send(e)
        })
        
      }    
    });
  });
});


app.post("/login", (req, res) => {

  const {correo, password} = req.body
  console.log(req.body);
  
  const query = `SELECT * FROM usuarios WHERE correo = '${correo}' and contraseña ='${password}' `;
  
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
          const id = result[0].id;
          const rol = result[0].rol;
          const token = jwt.sign({ correo: correo }, "el botas", {expiresIn:"10m"});
          console.log(id);
          res.status(200).json({token, id,rol});
          console.log("correcto");
        }
      });
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error inesperado");
  }
});

app.post("/hola",(req, res)=>{
  console.log(req.body);
  
  req.getConnection((err, con)=>{
    if(err){
      console.log("err");
      
    }else{
     console.log("bien");
     
    }
  })
})
app.post("/pendientespost", upload.single('imagen'), async (req, res) => {
  const body = Object.assign({}, req.body);
console.log("entro");

 
const imagenUrl = req.file.path.match(/https:\/\/res\.cloudinary\.com\/[^\s]+/)[0];


  const { nombre, regalos, numero, ciudad, latitud, longitud} = req.body;
console.log(req.file);

  try {
    
    
   
    const sql = 'INSERT INTO pueblo (nombre) VALUES (?)';
    const values = [nombre];

    req.getConnection((err, con) => {
      if (err) {
        console.error("Error de conexión a la base de datos:", err);
        return res.status(100).send('Error de conexión a la base de datos');
      }
      con.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error al insertar en la base de datos:", err);
          return res.send(err);
        }
        res.status(200).send({ message: 'Registro exitoso', id: result.insertId, imagen: imagenUrl });
      });
    });
  } catch (error) {
    console.error(error)
    return res.status(200).send("Error al subir la imagen" );
  }
});




















app.post('/comprobar', (req, res) => {
  const { codigo, correo } = req.body;

  const sql = 'SELECT codigo FROM usuarios WHERE correo = ?';
  const values = [correo];

  req.getConnection((err, con) => {
      if (err) {
          console.error("Error de conexión a la base de datos:", err);
          return res.status(500).send('Error de conexión a la base de datos'); // Solo envía un string aquí
      }
      
      con.query(sql, values, (err, result) => {
          if (err) {
              console.error("Error al consultar en la base de datos:", err);
              return res.status(500).send('Error al consultar en la base de datos'); // Envía un string indicando el error
          }
          
          if (result.length === 0) {
              return res.status(404).send('Usuario no encontrado'); // Usuario no encontrado
          }

          if (result[0].codigo === parseInt(codigo)) {
              const actualizar = 'UPDATE usuarios SET verificacion = ? WHERE correo = ?';
              con.query(actualizar, [true, correo], (err) => {
                  if (err) {
                      console.error("Error al actualizar en la base de datos:", err);
                      return res.status(500).send('Error al actualizar en la base de datos'); 
                  }
                  return res.send("Código verificado correctamente"); 
              });
          } else {
              return res.status(401).json({
                  error: 'Código incorrecto', 
                  enviado: codigo, 
                  esperado: result[0].codigo 
              });
          }
      });
  });
});



app.listen(4200, () => {
  console.log("Server running on port 4200");
});