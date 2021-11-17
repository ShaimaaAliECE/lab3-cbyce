const express = require('express');
const newConnection = require('./connectionDB');

//Change select times to accom lastUpdate
const correctUsr = "admin";
const correctPass = "123";
const app = express();

// serve static contents
app.use(express.static('static'));

app.use(express.urlencoded({
    extended: true
}));

// Admin page login
app.post('/admin', (req, res) => {
    if(req.body.adminUsr === correctUsr && req.body.adminPass === correctPass) {
        let conn = newConnection();
        conn.connect();

        let content = '<div><div>Doodle App - Admin Portal (Please save availability and time changes seperatly)</div>'
                            +'<table style="min-width: 100vw; padding: 5px 15px">';                                        

        conn.query( `select * from Availability order by Name, case Name when "Admin" then '1' else '2' end`
                , (err,rows,fields) => {
                    if (err)
                        console.log(err);
                    else {
                        let adminTimes = JSON.parse(rows[0].AvailTimes);
                        rows.shift();

                        content +='<table style="min-width: 100vw; padding: 5px 15px">'
                                    +'<form action="/admin/time" method="post" style="display:table-header-group; vertical-align: middle; border-color: inherit">'
                                        +'<tr>'
                                            +'<th>Name</th>';
                        
                        for (var i = 0; i < 10; i++) {
                            content += '<th><input type="time" id="t' + i + '" name="t' + i + '" value="' + adminTimes[i] + '" required></th>'
                        }
                        
                        content +='</tr>'
                                +'<tr>'
                                    +'<th></th>'
                                    +'<th colspan="10"><button type="submit" id="save-times-btn">Save Time Changes</button></th>'
                                +'</tr>'
                            +'</form>'
                            +'<form action="/admin/avail" method="post">';


                        for(r of rows) {
                            let times = JSON.parse(r.AvailTimes);

                            content += '<tr><td style="text-align: center; width:175px"><input type="text" id="' + r.Name + '-row" value="' + r.Name + '" readonly></td>';

                            for(var i = 0; i < adminTimes.length; i++){
                                if(times[`${adminTimes[i]}`]) {
                                    content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + 'Box' + i + '" name="' + r.Name + 'Box' + i + '" checked="checkced"></td>';
                                } else {
                                    content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + 'Box' + i + '" name="' + r.Name + 'Box' + i + '"></td>'; //onclick="return false;
                                }
                            }

                            content += '</tr>';
                        }

                        content +='<tr>'
                                    +'<th></th>'
                                    +'<th colspan="10"><button type="submit" id="save-avail-btn">Save Availability Changes</button></th>'
                                +'</tr></form></table></div>';

                        res.send(content);
                    }
                });
        conn.end();
    } else {
        res.redirect("/");
    }
});

app.post('/admin/avail', (req, res) => {
    //WIll need to reaccess time, Add page warning about change time or avail not both at once
    let times = [];
    let updates = [];
    let updateStr = `Update Availability Set LastUpdate = CURRENT_TIME(), AvailTimes = (case Name `;
    let usrs = [];

    let conn = newConnection();
    conn.connect();
    
    conn.query( `select * from Availability order by Name, case Name when "Admin" then '1' else '2' end`
            , (err,rows,fields) => {
                if (err) {
                    console.log(err);
                    res.send("Failure");
                } else {
                    console.log('Row Selects');
                    times = JSON.parse(rows[0].AvailTimes);
                    rows.shift();

                    for(r of rows) {
                        usrs.push([r.Name, JSON.parse(r.AvailTimes)]); //AvailTimes is still string here
                    }

                    for(var i = 0; i < usrs.length; i++) {
                        for(var j = 0; j < 10; j++) {
                            if(!updates.includes(usrs[i][0]) && !((req.body[`${usrs[i][0] + "Box" + j}`] == "on") == usrs[i][1][`${times[j]}`]) ) {
                                updates.push(i);
                            } 
                            usrs[i][1][`${times[j]}`] = (req.body[`${usrs[i][0] + "Box" + j}`] == "on");
                        }
                    }

                    for(u of updates) {
                        updateStr += `When '` + usrs[u][0] + `' then '` + JSON.stringify(usrs[u][1]) + `' `;
                    }

                    updateStr += `Else (AvailTimes) End)`;

                    console.log(updateStr);
                    console.log(updates.length);

                    if (updates.length > 0) {
                       conn.query(updateStr, (err,rows,fields) => {
                            if(err) {
                                res.send("Could not complete update");
                            } else {
                                res.send('Update Successful');
                            }
                        })
                        
                    } else {
                        res.send("No Updates made as no changes were made");
                    }
                }
    })
    
    conn.end();
});

app.post('/admin/time', (req, res) => {
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
                    if (err) {
                        console.log(err);
                        res.send("Availability was not added. Please retry.");
                    } else {
                        console.log('Row Inserted');
                        res.redirect("/guest");
                    }
                });
        conn.end(); 
   } else {
       res.send("Duplicate names cannot be added to the availability page. Please enter another variation of your name or ad a sufix/prefix");
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
                                                +'<th>Name</th>';

                    for(var i = 0; i < 10; i ++) {
                        content += '<th><input type="time" name="t' + i + '" value="' + adminTimes[i] + '" readonly></th>';
                    }

                    content +='</tr></thead><tbody>';

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