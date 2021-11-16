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
                                            +'<th><input type="time" id="t0" name="t0" min="00:00" max="23:59" value="' + adminTimes[0] + '" required></th>'
                                            +'<th><input type="time" id="t1" name="t1" min="00:00" max="23:59" value="' + adminTimes[1] + '" required></th>'
                                            +'<th><input type="time" id="t2" name="t2" min="00:00" max="23:59" value="' + adminTimes[2] + '" required></th>'
                                            +'<th><input type="time" id="t3" name="t3" min="00:00" max="23:59" value="' + adminTimes[3] + '" required></th>'
                                            +'<th><input type="time" id="t4" name="t4" min="00:00" max="23:59" value="' + adminTimes[4] + '" required></th>'
                                            +'<th><input type="time" id="t5" name="t5" min="00:00" max="23:59" value="' + adminTimes[5] + '" required></th>'
                                            +'<th><input type="time" id="t6" name="t6" min="00:00" max="23:59" value="' + adminTimes[6] + '" required></th>'
                                            +'<th><input type="time" id="t7" name="t7" min="00:00" max="23:59" value="' + adminTimes[7] + '" required></th>'
                                            +'<th><input type="time" id="t8" name="t8" min="00:00" max="23:59" value="' + adminTimes[8] + '" required></th>'
                                            +'<th><input type="time" id="t9" name="t9" min="00:00" max="23:59" value="' + adminTimes[9] + '" required></th>'
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
    //let conn = newConnection();
    //conn.connect();

    let arr = [];
    let dupValErr = false //Duplicate value trying to be set error
    //let clock;
    for (var i = 0; i < 10; i++) {
        //clock = req.body[`${"t" + i}`].split(":");

        if(arr.includes(req.body[`${"t" + i}`])) {
            dupValErr = true;
            i = 10; //Breaks loop once error is found
        } 

        arr.push(req.body[`${"t" + i}`]);

        //arr.push( parseInt( (clock[0] * 60) + clock[1] ) );
    }

    arr.sort();

    /* conn.query( `update Availability set LastUpdate = CURRENT_TIME(), AvailTimes = '` + dupValErr + `')`//, true, false, true)`
            , (err,rows,fields) => {
                if (err)
                    console.log(err);
                else
                    console.log('One row inserted');
            }); */
    console.log(arr[9]);
    console.log(JSON.stringify(arr));
    res.send(req.body.t0 + ", " + req.body.t9);
})

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

app.listen(2000);