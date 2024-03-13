const mysql = require('mysql2')
var express = require('express');
var app = express()
require('dotenv').config();


var connection = mysql.createConnection({
    host:process.env.MYSQL_HOST,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database:process.env.MYSQL_DATABASE
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
        SELECT location.university_name,
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
                 JOIN location ON device.location_id = location.id;
    `

    return new Promise(function (resolve, reject) {
        connection.query(select_all_devices, function (err, result,) {
            if (err) {
                reject(err)
            } else {
                const formatted_results = result.map(device => {
                    return {
                        luniversity_name: device.university_name,
                        device_status: device.device_status,
                        date_deployed: device.date_deployed,
                        electrocardiogram: device.electrocardiogram,
                        IMU: device.IMU,
                        optica_pulse_oximeter: device.optical_pulse_oximeter,
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

function addDevice() {
    q = ''
    connection.query(q, function (err, result) {
        if (err) throw err
        console.log('Device Added To The Data Base')
    })
}

module.exports = {allDevices}