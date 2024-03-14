const express = require('express');
const app = express();
const bodyparser = require('body-parser')
const db = require('./database')

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    res.render('index')
})


// app.get('/showPeople', async function (req, res) {
//     try {
//         const result = await db.allPeople();
//         const formattedData = result.map(person => {
//             return {
//                 first: person.first,
//                 last: person.last
//             }
//         })
//         res.render('showPeople', {data: formattedData});
//     } catch (err) {
//         console.error(err);
//         // Handle the error appropriately, maybe render error page
//         res.status(500).send('Internal Server Error');
//     }
// });

// Select all Devices From Database
app.get('/showDevices', async function (req, res) {
    console.log('Someone clicked a button')
    try {
        const result = await db.allDevices();
        if (result.length == 0) {
            res.send('NO DEVICES FOUND')
        } else {
            const formattedData = result.map(device => {
                return {
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
            res.render('show_devices', {devices: formattedData});
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('SERVER ERROR');
    }
});

app.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
