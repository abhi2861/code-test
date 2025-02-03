const moment = require('moment-timezone');

// validate the input object with excluded keys
exports.validateRequestBody = async (inputObject, excludedKeys = []) => {
    const jsonInput = inputObject;
    if (typeof jsonInput !== 'object')
        return Promise.reject({ message: 'inputObject is not an Object', statusCode: 400 });

    for (const key of Object.keys(jsonInput)) {
        if (!jsonInput[key] && !excludedKeys.includes(key)) {
            return Promise.reject({ message: `Please provide a valid ${key}`, statusCode: 400 });
        }
    }
    return Promise.resolve();
}

exports.response = (res,  data = null, metadata = {}, message = 'Success', status = 200) => {
    return res.json({
        message,
        ...metadata,
        data,
        status,
        token : res.locals.token
    });
}

exports.base64conversion = async (base64String) => {
    const parts = base64String.split('base64,');
    const base64 = parts.length > 1 ? parts[1] : base64String;
    const fileBuffer = Buffer.from(String(base64), 'base64');
    return fileBuffer;
}

exports.parseToDecimals = (value) => {
    if (value) {
        const parsedValue = parseFloat(value).toFixed(2);
        return parsedValue;
    }
    return '0.00';
}

exports.convertPacificTimeToUTC = (date, time)=> {
    let pacificTime
    // Convert the start date to start of the day in Pacific Time
    if(time === 'start')
     pacificTime = moment.tz(date, 'America/Los_Angeles').startOf('day');

    if(time === 'end')
    // Convert the end date to end of the day in Pacific Time
    pacificTime = moment.tz(date, 'America/Los_Angeles').endOf('day');

    // Convert these times to UTC
    const dayUTC = pacificTime.clone().tz('UTC');
    return dayUTC.format();
}

exports.convertPacificTimeToUTCWithDate = (date) => {
    // Convert the given date to UTC
    const utcDate = moment.tz(date, 'America/Los_Angeles').tz('UTC').toDate();
    return utcDate;
};