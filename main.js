const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const db = require('./js/connection')
const bcrypt = require('bcrypt')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const {isAuthenticated} = require("passport/lib/http/request");


app.set('view engine', 'ejs') // sets the view engin to look for .ejs files
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({
    secret: 'word', resave: false, saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
/**
 * Renders The main page of the website
 */
app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('index')
    } else {
        res.redirect('/login')
    }
})
/**
 * Function calls all the devices that are in the database
 */
app.get('/showDevices', async function (req, res) {
    if (req.isAuthenticated()) {
        //Logs that someone was routed to the show devices page
        console.log('Collecting devices')
        try {
            //calls function that selects all devices from database
            // stores result as result
            const result = await db.allDevices();
            //Checks if database is empty, Sends 'No Devices Found' on rendered page if empty
            if (result.length === 0) {
                res.send('NO DEVICES FOUND')
            } else {
                // formats data
                const formattedData = result.map(device => {
                    return {
                        model_number: device.model_number,
                        university_name: device.university_name,
                        device_status: device.device_status,
                        date_deployed: device.date_deployed,
                        electrocardiogram: device.electrocardiogram,
                        IMU: device.IMU,
                        optical_pulse_oximeter: device.optical_pulse_oximeter,
                        microphone: device.microphone,
                        temperature_sensor: device.temperature_sensor,
                        electronic_nose: device.electronic_nose,
                        galvanic_skin_response: device.galvanic_skin_response,
                        microcontroller_model_number: device.microcontroller_model_number,
                        info_about_data_storage: device.info_about_data_storage
                    };
                });
                //Renders show devices page, with the input formatted devices
                // Is the EJS id
                res.render('show_devices', {devices: formattedData});
            }
        } catch (err) {
            // If error console log error, and send 500 server error
            console.log(err);
            res.status(500).send('SERVER ERROR');
        }
    } else {
        res.redirect('/login')
    }
})

// On click, re routs to add device screen rendering add_devices.ejs
app.get('/addDevice', function (req, res) {
    if (req.isAuthenticated()) {
        console.log('WORKING')
        res.render('add_devices')
    } else {
        res.redirect('/login')
    }
})

//On submit button click takes form information and send the sql query to the database inserting devices.
app.post('/addDevice', async function (req, res) {
    if (req.isAuthenticated()) {//calls the function req.body as body
        const body = req.body
        //calls addDevice Function and uses form data from ejs as the input data
        await db.addDevice(body.location_school, body.electrocardiogram, body.inertial_measurement_unit, body.optical_pulse_oximeter, body.microphone, body.temperature_sensor, body.electronic_nose, body.galvanic_skin_response, body.micro_controller_number, body.real_time_clock_model_number, body.info_about_data_storage, body.firmware_version, body.date_installed, body.model_number, body.device_status, body.date_deployed)
        //After query completion re-directs to the main page
        res.render('index')
    } else {
        res.redirect('/login')
    }

})
// Redirects to change status page on button click
app.get('/changeStatus', async function (req, res) {
    if (req.isAuthenticated()) {
        try {
            //Calls function to display all devices
            const result = await db.allDevices();
            //Checks if database is empty
            if (result.length === 0) {
                //If empty renders message
                res.send('No Devices in the database')
            } else {
                // stores formatted query data as formattedData
                const formattedData = result.map(device => {
                    return {
                        model_number: device.model_number, university_name: device.university_name
                    }
                })

                // Renders the change_status page with the formatted data as the input to the change_status.ejs file
                res.render('change_status', {devices: formattedData})
            }
        } catch (err) {
            // if err records the error and displays error message
            console.log('There is an', err)
            res.status(500).send('SERVER ERROR');
        }
    } else {
        res.redirect('/login')
    }
})
//After submitting change status calls function updates the table to selected status in the form
app.post('/changeStatus', async function (req, res) {
    if (req.isAuthenticated()) {
        try {
            // Stores information about device id as check will be an array if many is one normal int
            let check = req.body.deviceID
            //Checks to see if there are more than 1 device id selected in the form
            if (check === 1) {
                // If only one device is selected, the int gets pushed into an empty array as device
                var device = []
                device.push(req.body.deviceID)

            } else {
                // array gets stored as device
                var device = req.body.deviceID
            }
            // calls changeStatus function with input device and selected status
            db.changeStatus(device, req.body.status)

        } catch (err) {
            //display err in the console
            console.log(err)
        }
        // Redirects user to main page after form is submitted
        res.render('index')
    } else {
        res.redirect('/login')
    }
})
app.get('/login', async (req, res) => {
    res.render('login')

})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/', failureRedirect: '/login'
}))

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
        var result = await db.fetchUsers(username)
        if (result.length > 0) {
            const user = result[0]
            const storedHashedPassword = user.password
            bcrypt.compare(password, storedHashedPassword, (err, result) => {
                if (err) {
                    return cb(err)
                } else {
                    if (result) {
                        return cb(null, user)


                    } else {
                        return cb(null, false)
                    }
                }
            })
        } else {
            return cb('User Not Found')
        }
    } catch (error) {
        return cb(err)
    }
}))

passport.serializeUser((user, cb) => {
    cb(null, user)
})

passport.deserializeUser((user, cb) => {
    cb(null, user)
})

app.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
