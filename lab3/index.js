const express = require('express');
const newConnection = require('./connectionDB');

const app = express();

// serve static contents
app.use(express.static('static'));

app.use(express.urlencoded({
    extended: true
}));

app.post('/admin', (req, res) => {
    if(req.body.adminUsr === "admin" && req.body.adminPass === "123") {
        let conn = newConnection();
        conn.connect();

        //let arr = ["9:00","10:00","11:00","12:00","13:00","14:00", "15:00", "16:00", "17:00", "18:00"];

        let content = '<div>'
                        +'<div>Doodle App - Admin Portal</div>'
                            +'<table style="min-width: 100vw; padding: 5px 15px">'
                                +'<thead>'
                                    +'<tr>'
                                        +'<th>Name</th>';

        conn.query( `select * from Availability order by Name, case Name when "Admin" then '1' else '2' end`
                , (err,rows,fields) => {
                    if (err)
                        console.log(err);
                    else {
                        let adminTimes = JSON.parse(rows[0].AvailTimes);
                        rows.shift();

                        console.log(adminTimes[0]);

                        content +=   '<th><input type="time" id="time0" name="time0" min="00:00" max="23:59" value="' + adminTimes[0] + '" required></th>'
                                    +'<th><input type="time" id="time1" name="time1" min="00:00" max="23:59" value="' + adminTimes[1] + '" required></th>'
                                    +'<th><input type="time" id="time2" name="time2" min="00:00" max="23:59" value="' + adminTimes[2] + '" required></th>'
                                    +'<th><input type="time" id="time3" name="time3" min="00:00" max="23:59" value="' + adminTimes[3] + '" required></th>'
                                    +'<th><input type="time" id="time4" name="time4" min="00:00" max="23:59" value="' + adminTimes[4] + '" required></th>'
                                    +'<th><input type="time" id="time5" name="time5" min="00:00" max="23:59" value="' + adminTimes[5] + '" required></th>'
                                    +'<th><input type="time" id="time6" name="time6" min="00:00" max="23:59" value="' + adminTimes[6] + '" required></th>'
                                    +'<th><input type="time" id="time7" name="time7" min="00:00" max="23:59" value="' + adminTimes[7] + '" required></th>'
                                    +'<th><input type="time" id="time8" name="time8" min="00:00" max="23:59" value="' + adminTimes[8] + '" required></th>'
                                    +'<th><input type="time" id="time9" name="time9" min="00:00" max="23:59" value="' + adminTimes[9] + '" required></th>'
                                +'</tr>'
                                +'<tr>'
                                    +'<th colspan="11"><button type="button" id="save-times-btn">Save</button></th>'
                                +'</tr>'
                            +'</thead>'
                            +'<tbody>';


                        for(r of rows) {
                            let times = JSON.parse(r.AvailTimes);

                            content += '<tr><td style="text-align: center; width:175px"><input type="text" id="' + r.Name + '-row" value="' + r.Name + '" readonly></td>';

                            for(var i = 0; i < adminTimes.length; i++){
                                if(times[`${adminTimes[i]}`]) {
                                    content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" checked="checkced" onclick="return false;"></td>';
                                } else {
                                    content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" onclick="return false;"></td>';
                                }
                            }

                            content += '</tr>';
                        }

                        content += '</tr></tbody></table></div>';
                        res.send(content);
                    }
                });
        
        conn.end();
        
    } else {
        res.redirect("/");
    }
});

// dynamic handling
app.get('/guest', (req, res) => {
    let conn = newConnection();
    conn.connect();
    let content = '<div>'
                    +'<div>Doodle App</div>'
                        +'<table style="min-width: 100vw; padding: 5px 15px">'
                            +'<thead>'
                                +'<tr>'
                                    +'<th>Name</th>'
                                    +'<th>9am</th>'
                                    +'<th>10am</th>'
                                    +'<th>11am</th>'
                                    +'<th>12pm</th>'
                                    +'<th>1pm</th>'
                                    +'<th>2pm</th>'
                                    +'<th>3pm</th>'
                                    +'<th>4pm</th>'
                                    +'<th>5pm</th>'
                                    +'<th>6pm</th>'
                                +'</tr>'
                            +'</thead>'
                            +'<tbody>';

    conn.query( `select * from Availability `
            , (err,rows,fields) => {
                if (err)
                    console.log(err);
                else {
                    for(r of rows) {
                        let times = JSON.parse(r.AvailTimes);

                        content += '<tr><td style="text-align: center; width:175px"><input type="text" id="' + r.Name + '-row" value="' + r.Name + '" readonly></td>';

                        for(var i = 0; i < times.length; i++){
                            if(times[i]) {
                                content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" checked="checkced" onclick="return false;"></td>';
                            } else {
                                content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" onclick="return false;"></td>';
                            }
                        }

                        content += '</tr>';
                    }

                    content += '<tr><td style="text-align: center; width:175px"><input type="text" id="guest-name" placeholder="Name"></td>';

                    for(var i = 0; i < 10; i++) {
                        content += '<td style="text-align: center"><input type="checkbox" id="guest-box-' + i + '"></td>';
                    }
                    

                    content += '</tr></tbody></table><button type="button" id="save-guest-btn">Save</button></div>';
                    res.send(content);
                }
            });
    
    conn.end();
});

/* app.post('/guest', (req, res) = {

}); */

/* app.get('/login', (req, res) => {

    let content = '<div><h2>Admin Login</div>';

    //Save as cookies and refresh on click
    content += '<input type="text" id="adminName" placeholder="Username"/>'
    content += '<br><br>';
    content += '<input type="password" id="adminPassword" placeholder="Password"/>'
    content += '</div>';
    res.send(content);
}); */

app.listen(2000);