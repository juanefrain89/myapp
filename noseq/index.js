
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require("mysql");
const mysqlConexion = require("express-myconnection");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
app.set(4200);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cors({
  origin: "http://localhost:5173"
}));
const dbConfig = {
  host: "localhost",
  user: "id21868445_dentapp",
  password: "V18135w00sss*",
  database: "id21868445_dentapp"
};
app.use(mysqlConexion(mysql, dbConfig, "single"));


app.get('/connecton', (req, res) => {
   req.getConnection((err, con) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        res.status(500).send("Error al conectar a la base de datos");
        return;
      }
})
})


app.get("/", (req, res) => {
  res.send("Hola");
});


app.use(bodyParser.urlencoded({ extended: true }));
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

  const  {id}  = req.body;
  
    console.log("Correo recibido:", id);
    try {
      const query = `SELECT * FROM clientesdentistas WHERE id_dentista = '${id}'`;
  
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
            res.status(200).send(result)
           
          }
        });
      });
    } catch (error) {
      console.error("Error en el servidor:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });
  



  app.post("/eliminardatos", (req, res) => {

    const  {id}  = req.body;
    
    
      try {
        const query = `DELETE FROM clientesdentistas where id_personal  = '${id}'`;
    
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
              res.status(200).send(result)
             
            }
          });
        });
      } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error en el servidor" });
      }
    });

    app.post("/modificardatos", (req, res) => {

      const  {id}  = req.body;
      const {correo}=req.body;
      const {tratamiento, numero}=req.body;
        console.log("dsdssdsds:", id);
        try {
          const query = `update clientesdentistas set correo ='${correo}',numero ='${numero}' ,tratamiento='${tratamiento}'  where id_personal  = '${id}'`;
      
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

                res.status(200).send(result)

              }
            });
          });
        } catch (error) {
          console.error("Error en el servidor:", error);
          res.status(500).json({ error: "Error en el servidor" });
        }
      });
    


      app.post("/registrar", (req, res) => {

        const { password, correo, tratamiento, numero } = req.body;
        
          try {
            const query = `INSERT INTO clientesdentistas (id_dentista, correo, tratamiento, numero,password) 
            VALUES (1, '${correo}', '${tratamiento}', '${numero}', '${password}')`;

            console.log(query);
                   if (err)      req.getConnection((err, con) => {
  {
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
                  
                  
                  res.redirect("http://localhost:5173")
                   
                  
                 
                }
              });
            });
          } catch (error) {
            console.error("Error en el servidor:", error);
            res.status(500).json({ error: "Error en el servidor" });
          }
        });
      
  

        app.post("/user", (req, res) => {

          const  {id}  = req.body;
          
            console.log("Correo recibido:", id);
            try {
              const query = `SELECT * FROM usuarios_roles WHERE id = '${id}'`;
          
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
                    res.status(200).send(result)
                   
                  }
                });
              });
            } catch (error) {
              console.error("Error en el servidor:", error);
              res.status(500).json({ error: "Error en el servidor" });
            }
          });
          

          
        

          app.post("/userdatos", (req, res) => {

            const  {id}  = req.body;
            const {correo}=req.body;
            const {password}=req.body;
              console.log("dsdssdsds:", id);
              try {
                const query = `UPDATE usuarios_roles SET correo = '${correo}', password = '${password}' WHERE id = '${id}'`;

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
                      res.status(200).send(result)
                     
                    }
                  });
                });
              } catch (error) {
                console.error("Error en el servidor:", error);
                res.status(500).json({ error: "Error en el servidor" });
              }
            });
          



app.use(express.static(path.join(__dirname, "public")));

app.listen(4200, () => {
  console.log("Server running on port 3000");
 
});
