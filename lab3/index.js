const express = require('express');
const newConnection = require('./connectionDB');

const correctUsr = "admin";
const correctPass = "123";
const app = express();

// serve static contents
app.use(express.static('static'));

app.use(express.urlencoded({
    extended: true
}));

app.post('/admin', (req, res) => {
    if(req.body.adminUsr === correctUsr && req.body.adminPass === correctPass) {
        let conn = newConnection();
        conn.connect();

        let content = '<div><div>Doodle App - Admin Portal</div>'
                            +'<table style="min-width: 100vw; padding: 5px 15px">';                                        

        conn.query( `select * from Availability order by Name, case Name when "Admin" then '1' else '2' end`
                , (err,rows,fields) => {
                    if (err)
                        console.log(err);
                    else {
                        let adminTimes = JSON.parse(rows[0].AvailTimes);
                        rows.shift();

                        content +='<table style="min-width: 100vw; padding: 5px 15px">'
                                    +'<form action="/admin/changes" method="post" style="display:table-header-group; vertical-align: middle; border-color: inherit">'
                                        +'<tr>'
                                            +'<th>Name</th>'
                                            +'<th><input type="time" id="t0" name="t0" value="' + adminTimes[0] + '" required></th>'
                                            +'<th><input type="time" id="t1" name="t1" value="' + adminTimes[1] + '" required></th>'
                                            +'<th><input type="time" id="t2" name="t2" value="' + adminTimes[2] + '" required></th>'
                                            +'<th><input type="time" id="t3" name="t3" value="' + adminTimes[3] + '" required></th>'
                                            +'<th><input type="time" id="t4" name="t4" value="' + adminTimes[4] + '" required></th>'
                                            +'<th><input type="time" id="t5" name="t5" value="' + adminTimes[5] + '" required></th>'
                                            +'<th><input type="time" id="t6" name="t6" value="' + adminTimes[6] + '" required></th>'
                                            +'<th><input type="time" id="t7" name="t7" value="' + adminTimes[7] + '" required></th>'
                                            +'<th><input type="time" id="t8" name="t8" value="' + adminTimes[8] + '" required></th>'
                                            +'<th><input type="time" id="t9" name="t9" value="' + adminTimes[9] + '" required></th>'
                                        +'</tr>'
                                        +'<tr>'
                                            +'<th></th>'
                                            +'<th colspan="10"><button type="submit" id="save-times-btn">Save Time Changes</button></th>'
                                        +'</tr>'
                                    +'</form>'
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

app.post('/admin/changes', (req, res) => {
    let conn = newConnection();
    conn.connect();

    let newTimes = [];
    let dupValErr = false; //Duplicate value trying to be set error
    for (var i = 0; i < 10; i++) {
        if(newTimes.includes(req.body[`${"t" + i}`])) {
            dupValErr = true;
            i = 10; //Breaks loop once error is found
        } 
        newTimes.push(req.body[`${"t" + i}`]);
    }

    newTimes.sort();

    if (!dupValErr) {
        conn.query( `update Availability set LastUpdate = CURRENT_TIME(), AvailTimes = '` + JSON.stringify(newTimes) + `' where Name = "Admin"`
                , (err,rows,fields) => {
                    if (err)
                        console.log(err);
                    else {
                        console.log('Row Updates');
                    }
                    res.send("Changes successfully made. Please click the back arrow and refresh the page."); //************************* change to have better direction */
                });
        conn.end();
    } else {
        //Handle duplicate value attempt error
    }
});

app.post('/guest/register', (req, res) => {
    if (!(req.body.otherNames).includes(req.body.guestName)) {
        let conn = newConnection();
        conn.connect();

        let newAvail = {};
        for (var i = 0; i < 10; i++) {
            if (req.body[`${"box" + i}`] === "on") {
                newAvail[req.body[`${"t" + i}`]] = true;
            } else {
                newAvail[req.body[`${"t" + i}`]] = false;
            }
        }

        conn.query( `insert into Availability values("` + req.body.guestName + `",CURRENT_TIME(),'` + JSON.stringify(newAvail) + `')`
                , (err,rows,fields) => {
                    if (err)
                        console.log(err);
                    else {
                        console.log('Row Inserted');
                    }
                    res.send("Availability successfully added. Please click the back arrow and refresh the page."); //************************* change to have better direction */
                });
        conn.end(); 
   } else {
       res.end();
       //Handle error of same name
   } 
});

app.get('/guest', (req, res) => {
    let conn = newConnection();
    conn.connect();
    let content = '<div><div>Doodle App</div>';

    conn.query( `select * from Availability order by Name, case Name when "Admin" then '1' else '2' end`
            , (err,rows,fields) => {
                if (err)
                    console.log(err);
                else {
                    let adminTimes = JSON.parse(rows[0].AvailTimes);
                    rows.shift();

                    content += '<table style="min-width: 100vw; padding: 5px 15px">'
                                    +'<form method="post" action="/guest/register" style="display:table-row-group; vertical-align: middle; border-color: inherit">'
                                        +'<thead>'
                                            +'<tr>'
                                                +'<th>Name</th>'
                                                +'<th><input type="time" name="t0" value="' + adminTimes[0] + '" readonly></th>'
                                                +'<th><input type="time" name="t1" value="' + adminTimes[1] + '" readonly></th>'
                                                +'<th><input type="time" name="t2" value="' + adminTimes[2] + '" readonly></th>'
                                                +'<th><input type="time" name="t3" value="' + adminTimes[3] + '" readonly></th>'
                                                +'<th><input type="time" name="t4" value="' + adminTimes[4] + '" readonly></th>'
                                                +'<th><input type="time" name="t5" value="' + adminTimes[5] + '" readonly></th>'
                                                +'<th><input type="time" name="t6" value="' + adminTimes[6] + '" readonly></th>'
                                                +'<th><input type="time" name="t7" value="' + adminTimes[7] + '" readonly></th>'
                                                +'<th><input type="time" name="t8" value="' + adminTimes[8] + '" readonly></th>'
                                                +'<th><input type="time" name="t9" value="' + adminTimes[9] + '" readonly></th>'
                                            +'</tr>'
                                        +'</thead>'
                                        +'<tbody>';

                    for(r of rows) {
                        let times = JSON.parse(r.AvailTimes);

                        content += '<tr><td style="text-align: center; width:175px"><input type="text" id="' + r.Name + '-row" name="otherNames" value="' + r.Name + '" readonly></td>';

                        for(var i = 0; i < adminTimes.length; i++){
                            if(times[`${adminTimes[i]}`]) {
                                content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" checked="checkced" onclick="return false;"></td>';
                            } else {
                                content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" onclick="return false;"></td>';
                            }
                        }

                        content += '</tr>';
                    }

                    content += '<tr>'
                                    +'<td style="text-align: center; width:175px">'
                                        +'<input type="text" id="guest-name" name="guestName" placeholder="Name" required>'
                                    +'</td>';

                    for(var i = 0; i < 10; i++) {
                        content += '<td style="text-align: center"><input type="checkbox" name="box' + i + '"></td>';
                    }
                    

                    content += '</tr><tr><td style="text-align:center" colspan=11><button type="submit">Add Availability</button></td></tr></tbody></form></table></div>';

                    res.send(content);
                }
            });
    
    conn.end();
});

app.listen(2000);