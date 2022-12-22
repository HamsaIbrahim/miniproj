module.exports = function(app, shopData) {
const redirectLogin = (req, res, next) => {
if (!req.session.userId ) {
res.redirect('./login')
} else { next (); }
}

const { check, validationResult } = require('express-validator');



    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',redirectLogin, function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        let sqlquery = "select * from food where name like '%" + req.query.keyword + "%'"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
         let newData = Object.assign({}, shopData, {availableFood:result});
         res.render("list.ejs", newData)
       });
    
    });
    app.get('/weather', function (req,res) {
        res.render('weather.ejs', shopData);                                                                     
    });
    app.get('/weatherpage', function (req,res) {
    const request = require('request');
 let apiKey = 'd7a705b3cbfe0fef7514f4e92549dee3'; 
 let city = req.query.keyword;// this code helps to get information about all cities in the uk. 
 let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
 request(url, function (err, response, body) {
 if(err){
 console.log('error:', error);
 } else { 
// res.send(body);
var weather = JSON.parse(body)
if(weather!==undefined && weather.main!==undefined) { 
var wmsg = '<h1 style=color:magenta>British Weather Information: Check the weather for all the cities in the UK. <h1>'+ weather.main.temp + ' degrees in '+ weather.name + 
' <br>The humidity now is: ' + weather.main.humidity + '<br>The speed is: ' + weather.wind.speed + '<br>The timezone is: ' + weather.timezone + '<br>The visibility is: ' + weather.visibility; 
res.send (wmsg);//I have added a range of information where the user can see the humidity, wind speed, timezone and visibility of any city in the uk.
 } 
else {
 res.send("No data found");
}
}
 });
});


app.get('/api', function (req,res) {
 // Query database to get all the books
 let sqlquery = "SELECT * FROM food"; 
 // Execute the sql query
 db.query(sqlquery, (err, result) => { 
 if (err) {
 res.redirect('./');
 } 
 // Return results as a JSON object
 res.json(result); 
 });
 });

//Extension here is completed. 
app.get('/extapi', function (req,res) {
        res.render('extapi.ejs', shopData);
    });

app.get('/extapiresult', function (req,res) {
    // Query database to get all the books
 let sqlquery = "SELECT * FROM books where name like '%" + req.query.keyword + "%'";//This is where you can see the keyword for the extension is.
 // Execute the sql query
 db.query(sqlquery, (err, result) =>{ 
 if(err){
 res.redirect('./');
 }
 // Return results as a JSON object
 res.json(result);                                                                                                                                                                                        
 });
    });

     app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);
    });

        //login route
    app.get('/login',function(req,res){
        res.render("login.ejs", shopData);
    });
	//logout
	app.get('/logout', redirectLogin, (req,res) => {
	req.session.destroy(err => {
	if (err) {
	return res.redirect('./')
	}
	res.send('you are now logged out. <a href='+'./'+'>Home</a>');
	})
	})                                                                                                                                               
    //delete user route
     app.get('/deleteuser',redirectLogin, function(req,res){
        res.render("deleteuser.ejs", shopData);                                                                                                

    });                                                                                                                                        

    //deleted
     app.post('/userdeleted', function(req, res) {
    let sqlquery = "DELETE FROM food WHERE name = '" + req.body.name + "'";
        db.query(sqlquery, (err, result) => {
            if (err) {
                res,send('error', err)
                                                                                                                                               
            }
                                                                                                                                               
           result = 'User deleted: '  + req.body.name;
            res.send(result);                                                                                                                  
         });
                                                                                                                                               
    });                                                                                                                                           
                                                                                                                                               
    //loggedin 
     app.post('/loggedin', function(req, res) {
    const bcrypt = require('bcrypt');
     let sqlquery = "SELECT hashedPassword FROM userdetails WHERE username ='" + req.body.username + "'";
        db.query(sqlquery, (err, result) => {
            if (err) {
              res.redirect('./');
            }
     HashedPassword = result[0].hashedPassword;
     bcrypt.compare(req.body.password, HashedPassword, function(err, result){
            if(err) {
              res.send(err);                                                                                                                   
            }
             else if (result == true) {
	    // Save user session here, when login is successful
	    req.session.userId = req.body.username;
             res.send("succesful login!");
            }
            else {
           res.send("Incorrect password, please try again!");
            }
         });                                                                                                                                   
                                                                            });
    });

    app.get('/listusers', redirectLogin, function(req, res) {
     let sqlquery = "SELECT * FROM userdetails";  
     db.query(sqlquery, (err, result) => {
           if (err) {
              res.redirect('./');
           }
           let newData = Object.assign({}, shopData, {availableUserdetails:result});
           res.render("listusers.ejs", newData)
        });
     });
     //These are the validations i have added to ensure the input for the register page is appropriate. 
     app.post('/registered',[check('email').isEmail().normalizeEmail(),  
     check('password').isLength({min:8}),check('first').notEmpty(), 
     check('username').notEmpty().trim()], function (req,res) {
      const errors = validationResult(req);
	if (!errors.isEmpty()) {
	res.redirect('./register'); }
	else {
	const bcrypt = require('bcrypt');
      const saltRounds = 10;
      const plainPassword = req.body.password;
                                                                                                                                               
      //Sanitation has been added to every for secuirty purposes. I.E. hackers accessing the database.
      bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
         sqlquery = "INSERT INTO userdetails (firstname, lastname, email, username, hashedPassword) VALUES (?,?,?,?,?)";
         let newrecord = [req.sanitize(req.body.first), req.sanitize(req.body.last), req.sanitize(req.body.email), req.sanitize(req.body.username), hashedPassword];
         db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
         
                    return console.error(err, message);
         }
          else
  
             result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered! We will send an email to you at ' + req.body.email;                                                                                                                                            
             result += 'Your password is: '+ req.body.password +' your hashed password: '+ hashedPassword;
             res.send(result);                                                                                                                 
            });
 
         })
	} 
     });
      app.get('/addbook',redirectLogin, function (req,res) {
        res.render('addbook.ejs', shopData);
    });

    app.get('/list', redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM food"; 
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {availableFood:result});
            res.render("list.ejs", newData)
         });
    });
      app.get('/bargainbooks', redirectLogin, function(req, res) {
        let sqlquery = "SELECT name, price FROM books WHERE price<20"; 
        
        ;db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            res.render("bargainbooks.ejs", newData)
         });
    });
                                                                                                                                                                                                                     
    app.post('/bookadded', function (req,res) {
          
          let sqlquery = "INSERT INTO food (name, username, typicalvalue, unitvalue, carb, fat, protein, salt, sugar) VALUES (?,?,?,?,?,?,?,?,?)";
          
          let newrecord = [req.body.name, req.body.username, req.body.typicalvalue, req.body.unitvalue, req.body.carb, req.body.fat, req.body.protein, req.body.salt, req.body.sugar];
          db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              return console.error(err.message);
            }
            else
            res.send(' This food recipe is added to database, name: '+ req.body.name);
            });
      });                                            


}
