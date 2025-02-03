import moment from 'moment-timezone';


// convert base64 to blobUrl
export const base64toUrl = async (url) => {
    const r = await fetch(url);
    const blob = await r.blob();
    const blobcreate = URL.createObjectURL(blob);
    // return window.open(blobcreate, "_blank");
    const newWindow = window.open(blobcreate, '_blank');
    if (newWindow) {
        return newWindow.focus();
    } else {
        return
    }
}

// format date
export const convertToBaseFormatDate = (value, isFromDatabase = false, showTime = false, monthFormat = 'MMMM', documents = false, timezone = 'America/Los_Angeles') => {

    if (!value)
        return '';

    if (isFromDatabase) {

        value = new Date(value);

        if (documents)
            return moment.utc(value).tz(timezone).format('MM/DD/YYYY');

        if (showTime)
            return moment.utc(value).tz(timezone).format(monthFormat + ' D, YYYY hh:mm A');    
        else
            return moment.utc(value).tz(timezone).format(monthFormat + ' D, YYYY');
    }
    else
        // return moment(value).format(monthFormat + ' D, YYYY');
        return moment.utc(value).tz(timezone).format('MM-DD-YYYY');


}

// split date 
export const splitDate = (isoString) =>{
    const [year, month, day] = isoString.split('T')[0].split('-');
    return `${month}-${day}-${year}`;
}

//disable the previous value from current date
export const formatDate = (date) => {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    // Append '0' before single digit months/days
    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }

    return `${year}-${month}-${day}`;
}

export const currencifyInDollars = (amount = '', showDollar = true, showPercentage = false) => {

    let isNegativeNumber = false;
    const concatString = showDollar ? '$' : '';

    amount = amount ? amount.toString() : '0';

    if (amount.indexOf('-') > -1) {
        amount = amount.replace('-', '');
        isNegativeNumber = true;
    }

    let amt = ''
    const decimalPart = amount.indexOf('.') > -1 ? amount.slice(amount.indexOf('.'), amount.length) : '';
    amount = amount.indexOf('.') > -1 ? amount.slice(0, amount.indexOf('.')) : amount;

    while (true) {

        let amountLength = amount.length;
        if (amountLength > 3) {
            amt = amount.slice(amountLength - 3, amountLength) + ',' + amt;
            amount = amount.slice(0, amountLength - 3)
        }
        else {
            amt = amount ? amount + ',' + amt : '0';
            break;
        }

    }

    let finalamount = concatString + amt.slice(0, amt.length - 1) + decimalPart;

    if (showPercentage) {
        finalamount += '%';
    }

    return isNegativeNumber ? '-' + finalamount : finalamount;

}


// Function to check if the file is an Excel sheete
export const isExcelFile = (file) => {
    const acceptedExcelTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    return file && acceptedExcelTypes.includes(file.type);
};


//documents upload 
export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result)
        }
        fileReader.onerror = (error) => {
            reject(error)
        }
    })
}

//show time in sec / min / hour
export const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds >= 3600) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours > 1 ? "hours" : "hour"} ago`;
    } else if (diffInSeconds >= 60) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`;
    } else {
      return `${diffInSeconds} ${diffInSeconds > 1 ? "seconds" : "second"} ago`;
    }
  };