const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const db = mysql.createConnection({
    host: '172.17.0.2',
    port: 3306,
    user: 'root',
    password: 'fmlrifas',
    database: 'fmlrifas'
});

db.connect();
app.use(cors());
app.use(express.json());

const jsonDealer = '{"Lucas": "2022", "João": "0987"}'
const jsonAdm = '{"Carlos": "1234", "James_TI": "1234", "Fabio95x": "8143"}'
const jsonCoupon = '{"FML2022": "30"}'


app.post("/login", (req, res) => {
    const { name, password } = req.body;
    const adm = JSON.parse(jsonAdm);
    const dealer = JSON.parse(jsonDealer);

    if(adm[name] === password){
       res.send({name, password, permission: 'adm'})
    };

    if(dealer[name] === password){
      res.send({name, password, permission: 'dealer'})
    };

   res.send({name: 'User not found'})
});


app.post("/coupon", (req, res) => {
    const { coupon } = req.body;
    const couponObj = JSON.parse(jsonCoupon);

    if(couponObj[coupon]){
       res.send({coupon: coupon, discount: couponObj[coupon]})
   };

   res.send({coupon: 'Coupon not found'})
});


app.get("/countCards", function (req, res) {
    const SQL = "SELECT status, count(*) FROM rifa_01 GROUP BY status";

    db.query(SQL, (error, results) => {
        if (error) {
            throw error
        };

        res.send(results);
    });
});


app.put("/approveCard", function (req, res) {
    const { number, name, password } = req.body;
    const adm = JSON.parse(jsonAdm);

     db.query("SELECT * FROM rifa_01 WHERE number = ?", [number], (error, result) => {
        const sql = "UPDATE rifa_01 SET status = 'paid' WHERE number = ?;";
        const values = [number];

        if (error) {
            res.send(error);
        };


        if (adm[name] === password){
            db.query(sql, values, (error, results) => {

                if (error) {
                    res.send(error);
                };

                res.send(result);
            });
        };

    });

});


app.get("/rejectCard", function (req, res) {
    const { number, name, password } = req.query;
    const adm = JSON.parse(jsonAdm);

     db.query("SELECT * FROM rifa_01 WHERE number = ?", [number], (error, result) => {
        const sql = "DELETE FROM rifa_01 WHERE number = ?;";
        const values = [number];

        if (error) {
            res.send(error);
        };


        if (adm[name] === password){
            db.query(sql, values, (error, results) => {

                if (error) {
                    res.send(error);
                };

                res.send(result);
            });
        };

    });

});


app.put("/updateBuy", (req, res) => {
    const { number, name, phone, coupon } = req.body;
    const couponObj = JSON.parse(jsonCoupon);


    db.query("SELECT * FROM rifa_01 WHERE number = ?", [number], (error, result) => {
        const sql = "UPDATE rifa_01 SET name = ?, phone = ?, coupon = ? WHERE number = ?;";
        const values = [name, phone, coupon, number];

        if (error) {
            res.send(error);
        };

        if (result[0].name === 'Number added to cart'){
             if (coupon === "empty" || couponObj[coupon]){
                   db.query(sql, values, (error, results) => {

                if (error) {
                    res.send(error);
                };

                res.send(result);
            });

           };
        };
    });
});





app.put("/deleteBuy", (req, res) => {
  const { number } = req.body;

 db.query("SELECT * FROM rifa_01 WHERE number = ?", [number], (error, result) => {
        const sql = "UPDATE rifa_01 SET name = 'empty', status = 'empty' WHERE number = ?;";
        const values = [number];

        if (error) {
            res.send(error);
        };

        if (result[0].name === 'Number added to cart'){
            db.query(sql, values, (error, results) => {

                if (error) {
                    res.send(error);
                };

                res.send(result);
            });
        };
    });

});






app.put("/registerBuy", (req, res) => {
    const { number } = req.body;

 db.query("SELECT * FROM rifa_01 WHERE number = ?", [number], (error, result) => {
        const sql = "UPDATE rifa_01 SET name = 'Number added to cart', status = 'analyzed' WHERE number = ?;";
        const values = [number];

        if (error) {
            res.send(error);
        };

        if (result[0].status === 'empty'){
            db.query(sql, values, (error, results) => {

                if (error) {
                    res.send(error);
                };

                res.send(result);
            });
        };
    });
});








app.get("/products", function (req, res) {
    db.query("SELECT * FROM rifa_01", (error, results) => {
        if (error) {
            res.send(error);
        };

        res.send(results.map(item => (
            {
                id: item.id,
                number: item.number,
                name: item.name,
                phone: item.phone,
                coupon: item.coupon,
                price: item.price,
                analyzed: item.analyzed,
                created_at: item.created_at
            }
        )));
    });
});


app.get("/getCards", function (req, res) {
    const { firstNumber, lastNumber } = req.query;

    const SQL = "SELECT * FROM rifa_01 where number BETWEEN ? AND ?";
    const values = [firstNumber, lastNumber];

    db.query(SQL, values, (error, results) => {
        if (error) {
            throw error
        };

        res.send(results);
    });
});


app.get("/getAll", function (req, res) {
    const { firstNumber, rewindPage } = req.query;

    const SQL = {
         true: "SELECT * FROM rifa_01 where number <= ? ORDER BY number desc LIMIT 504;",
         false: "SELECT * FROM rifa_01 where number >= ? ORDER BY number LIMIT 504;"
         };

    const values = [firstNumber];

    db.query(SQL[rewindPage], values, (error, results) => {
        if (error) {
            throw error
        };

        res.send(results);
    });
});


app.get("/getAnalyzed", function (req, res) {
    const { firstNumber, rewindPage } = req.query;

    const SQL = {
         true: "SELECT * FROM rifa_01 where number <= ? AND status = 'analyzed' ORDER BY number desc LIMIT 504;",
         false: "SELECT * FROM rifa_01 where number >= ? AND status = 'analyzed' ORDER BY number LIMIT 504;"
         };

    const values = [firstNumber];

    db.query(SQL[rewindPage], values, (error, results) => {
        if (error) {
            throw error
        };

        res.send(results);
    });
});


app.get("/getPaid", function (req, res) {
    const { firstNumber, rewindPage } = req.query;

    const SQL = {
         true: "SELECT * FROM rifa_01 where number <= ? AND status = 'paid' ORDER BY number desc LIMIT 504;",
         false: "SELECT * FROM rifa_01 where number >= ? AND status = 'paid' ORDER BY number LIMIT 504;"
         };

    const values = [firstNumber];

    db.query(SQL[rewindPage], values, (error, results) => {
        if (error) {
            throw error
        };

        res.send(results);
    });
});



app.get("/getEmpty", function (req, res) {
    const { firstNumber, rewindPage } = req.query;

    const SQL = {
         true: "SELECT * FROM rifa_01 where number <= ? AND status = 'empty' ORDER BY number desc LIMIT 504;",
         false: "SELECT * FROM rifa_01 where number >= ? AND status = 'empty' ORDER BY number LIMIT 504;"
         };

    const values = [firstNumber];

    db.query(SQL[rewindPage], values, (error, results) => {
        if (error) {
            throw error
        };

        res.send(results);
    });
});






app.get("/deleteAll", function (req, res) {
    const { name, password } = req.query;
    const adm = JSON.parse(jsonAdm);

     db.query("SELECT * FROM rifa_01;", [], (error, result) => {
        const sql = "DELETE FROM rifa_01;";
        const values = [];

        if (error) {
            res.send(error);
        };


        if (adm[name] === password){
            db.query(sql, values, (error, results) => {

                if (error) {
                    res.send(error);
                };

                res.send(result);
            });
        };

    });

});





app.listen(3000, () => {
    console.log('Listening on port 3000');
});
