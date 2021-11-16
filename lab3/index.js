const express = require('express');
const newConnection = require('./connectionDB');

const app = express();

// serve static contents
app.use(express.static('static'));

// dynamic handling
app.get('/guest', (req, res) => {
    let avail = [];
    let conn = newConnection();
    conn.connect();
    let content = '<div>'
                    +'<div>Doodle App</div>'
                        +'<table style="min-width: 100vw;">'
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

                        content += '<tr><td style="text-align: center"><input type="text" id="' + r.Name + '-row" value="' + r.Name + '" readonly></td>';

                        console.log(times.length);

                        for(var i = 0; i < times.length; i++){
                            if(times[i]) {
                                content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" checked="checkced" onclick="return false;"></td>';
                            } else {
                                content += '<td style="text-align: center"><input type="checkbox" id="' + r.Name + '-box-' + i + '" onclick="return false;"></td>';
                            }
                        }

                        content += '</tr>';
                    }

                    content += '<tr><td style="text-align: center"><input type="text" id="guest-name" placeholder="Name"></td>';

                    for(var i = 0; i < 10; i++) {
                        content += '<td style="text-align: center"><input type="checkbox" id="guest-box-' + i + '"></td>';
                    }
                    

                    content += '</tr></tbody></table></div>';
                    res.send(content);
                }
            });
    
    conn.end();
});

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