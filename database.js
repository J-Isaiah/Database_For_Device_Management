const mysql = require('mysql2')


require('dotenv').config();


const connection = mysql.createConnection({
    multipleStatements: true,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

// View All Devices
// function allPeople() {
//     let select_people = 'SELECT first_name AS first, last_name as last FROM study_victims ';
//     return new Promise(function (resolve, reject) {
//         connection.query(select_people, function (err, result) {
//             if (err) {
//                 reject(err)
//             } else {
//                 const formattedResult = result.map(person => {
//                     return {
//                         first: person.first,
//                         last: person.last
//                     }
//                 })
//                 resolve(formattedResult)
//                 console.log(formattedResult)
//             }
//         })
//     })
// }

// Show All devices

// Function
// allDevices()

function allDevices() {
    let select_all_devices = `
        SELECT location_school.university_name,
               device.model_number,
               device.device_status,
               device.date_deployed,
               sensors.electrocardiogram,
               sensors.IMU,
               sensors.optical_pulse_oximeter,
               sensors.microphone,
               sensors.temperature_sensor,
               sensors.electronic_nose,
               sensors.galvanic_skin_response,
               hardware_profile.microcontroller_model_number,
               info_about_data_storage
        FROM device
                 JOIN hardware_profile ON device.hardware_id = hardware_profile.id
                 JOIN sensors ON device.hardware_id = sensors.id
                 JOIN location_school ON device.location_id = location_school.id;
    `

    return new Promise(function (resolve, reject) {
        connection.query(select_all_devices, function (err, result,) {
            if (err) {
                reject(err)
            } else {
                const formatted_results = result.map(device => {
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
                    }
                })
                resolve(formatted_results)
            }
        })
    })
}

// Adding A device to the database

// function addDevice(location_school, electrocardiogram, inertial_measurement_unit, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response, micro_controller_number, real_time_clock_model_number, info_about_data_storage, firmware_version, date_installed, model_number, device_status, date_deployed) {
//     let queries = [{
//         q: 'INSERT INTO hardware_profile (microcontroller_model_number, real_time_clock_model_number, info_about_data_storage) VALUES (?,?,?)',
//         v: [micro_controller_number, real_time_clock_model_number, info_about_data_storage]
//     }, {
//         q: 'INSERT INTO sensors (electrocardiogram, IMU, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response) VALUES (?,?,?,?,?,?,?)',
//         v: [electrocardiogram, inertial_m*/easurement_unit, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response]
//     }, {
//         q: 'INSERT INTO firmware (firmware_version, date_installed) VALUES (?,?)',
//         v: [firmware_version, date_installed]
//     }, {
//         q: 'INSERT INTO location_school (university_name) values (?)',
//         v: [location_school]
//
//     }, {
//         q: 'INSERT INTO device (model_number, device_status, date_deployed) values (?,?,?)',
//         v: [model_number, device_status, date_deployed]
//
//     }]
//
//     queries.forEach((query) => {
//         console.log((query.q))
//         connection.query(query.q, query.v, function (err, result) {
//             if (err) {
//                 console.error('err executing query', err)
//             } else {
//                 console.log(result)
//
//             }
//         })
//     })
// }

async function addDevice(location_school, electrocardiogram, inertial_measurement_unit, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response, micro_controller_number, real_time_clock_model_number, info_about_data_storage, firmware_version, date_installed, model_number, device_status, date_deployed) {
    let device_fkey = []
    let queries = [{
        q: 'INSERT INTO hardware_profile (microcontroller_model_number, real_time_clock_model_number, info_about_data_storage) VALUES (?,?,?)',
        v: [micro_controller_number, real_time_clock_model_number, info_about_data_storage]
    }, {
        q: 'INSERT INTO sensors (electrocardiogram, IMU, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response) VALUES (?,?,?,?,?,?,?)',
        v: [electrocardiogram, inertial_measurement_unit, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response]
    }, {
        q: 'INSERT INTO firmware (firmware_version, date_installed) VALUES (?,?)', v: [firmware_version, date_installed]
    }, {
        q: 'INSERT INTO location_school (university_name) values (?)', v: [location_school]

    },]

    await queries.forEach((query) => {
        console.log((query.q))
        connection.query(query.q, query.v, function (err, result) {
            if (err) {
                console.error('err executing query', err)
            } else {
                device_fkey.push(result.insertId)


            }

        })
    })
    await new Promise(function (resolve, reject){


    })
}

// async function addDevice() {
//     await connection.execute('INSERT INTO hardware_profile (microcontroller_model_number, real_time_clock_model_number, info_about_data_storage) VALUES (?,?,?)', [1111, ' 2024-03-21 00:00:00', 'test'], function (err, result) {
//         if (err) {
//             console.log(err)
//         } else {
//             console.log(result.id)
//         }
//     })
// }

module.exports = {addDevice}

