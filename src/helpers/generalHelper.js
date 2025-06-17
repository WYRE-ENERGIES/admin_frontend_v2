import moment from "moment";

export const downloadFile = (data, downloadName = 'raw_data.csv') => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);

    return link.click()
}

export const compareDateInfo = (dateInfo, minutes) =>{
    return moment().isAfter(moment(dateInfo).add('minutes', minutes));
}
