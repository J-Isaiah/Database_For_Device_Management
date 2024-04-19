const mysql = require('mysql2')
// Enables .env files to be read in as data
require('dotenv').config();

const connection = mysql.createConnection({
    // enables multiple sql queries in one connection
    multipleStatements: true, // Uses environment variables as the input
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

/**
 * Function queries all the devices in the database
 * @returns device data
 */
function allDevices() {
    //Select statement to the database
    let select_all_devices = `SELECT location_school.university_name,
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
                 JOIN location_school ON device.location_id = location_school.id;`
    //runs select statement and receives data from the database
    return new Promise(function (resolve, reject) {
        connection.query(select_all_devices, function (err, result,) {
            if (err) {
                reject(err)
            } else {
                //Stores results in var formatted_results
                const formatted_results = result.map(device => {
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
                    }
                })
                resolve(formatted_results)
            }
        })
    })
}

/**
 * adds devices to database using data that was pushed by a form
 * @param location_school
 * @param electrocardiogram
 * @param inertial_measurement_unit
 * @param optical_pulse_oximeter
 * @param microphone
 * @param temperature_sensor
 * @param electronic_nose
 * @param galvanic_skin_response
 * @param micro_controller_number
 * @param real_time_clock_model_number
 * @param info_about_data_storage
 * @param firmware_version
 * @param date_installed
 * @param model_number
 * @param device_status
 * @param date_deployed
 * @returns null
 */
async function addDevice(location_school, electrocardiogram, inertial_measurement_unit, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response, micro_controller_number, real_time_clock_model_number, info_about_data_storage, firmware_version, date_installed, model_number, device_status, date_deployed) {
    // Starts a transaction to the database
    connection.beginTransaction(async function (err) {
        if (err) {
            throw err;
        }

        try {
            //creates an empty array to push foreign keys into
            let device_fkey = [];
            // defines an array with insert statements and values
            let queries = [{
                q: 'INSERT INTO hardware_profile (microcontroller_model_number, real_time_clock_model_number, info_about_data_storage) VALUES (?,?,?)',
                v: [micro_controller_number, real_time_clock_model_number, info_about_data_storage]
            }, {
                q: 'INSERT INTO sensors (electrocardiogram, IMU, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response) VALUES (?,?,?,?,?,?,?)',
                v: [electrocardiogram, inertial_measurement_unit, optical_pulse_oximeter, microphone, temperature_sensor, electronic_nose, galvanic_skin_response]
            }, {
                q: 'INSERT INTO firmware (firmware_version, date_installed) VALUES (?,?)',
                v: [firmware_version, date_installed]
            }, {
                q: 'INSERT INTO location_school (university_name) values (?)', v: [location_school]

            },]

            // Creates a new promise that executes all the insert queries
            await Promise.all(queries.map(async (query) => {
                const result = await new Promise((resolve, reject) => {
                    //creates a connection to the database using q as the queries and pushing v as the value the prepared statement uses
                    connection.query(query.q, query.v, function (err, result) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
                // After the device is inserted, pushes the PRIMARY key to the array device_fkey
                device_fkey.push(result.insertId);
            }));

            // queries for device
            let deviceQ = 'INSERT INTO device (model_number, device_status, date_deployed, Hardware_id, sensor_id, firmware_id,location_id) values (?,?,?,?,?,?,?)'
            // values for parameterised statement
            let deviceV = [model_number, device_status, date_deployed, ...device_fkey]
            // runs connection that inserts device, using fkeys to maintain the relationship of the database
            await new Promise((resolve, reject) => {
                connection.query(deviceQ, deviceV, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });

            // awaits for all the queries to execute
            await new Promise((resolve, reject) => {
                connection.commit((err) => {
                    if (err) {
                        return reject(err);
                    }
                    console.log('Transaction committed successfully.');
                    resolve();
                });
            });

        } catch (error) {
            // If err in queries
            // rejects transaction and rolls back database to pre err state
            console.error('Transaction failed, rolling back.', error);
            await new Promise((resolve, reject) => {
                connection.rollback(() => {
                    resolve(); // Always resolve after a rollback attempt
                });
            });
            throw error;
        }
    });
}

/**
 * changes device status by updating the status table in the database
 * @param device -- sent as string
 * @param status
 */
function changeStatus(device, status) {
// Loops for each device id passed through
    for (let i of device) {
        // Converts string of arrays into int of arrays
        id = parseInt(i)
        // Update statement
        const query = 'UPDATE device SET device_status = ? WHERE model_number = ?'
        // executes update status to the database, passing through the status and the device id
        connection.execute(query, [status, id], (err, result) => {
            if (err) {// if error output
                console.log('error was ' + err)
            } else {
                // console logs the affected rows
                console.log(result.affectedRows + ' Rows Changed')
            }
        })
    }
}


module.exports = {addDevice, allDevices, changeStatus}
