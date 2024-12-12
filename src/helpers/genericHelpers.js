// Formats Numbers which are greater than three digits with necessary commas
export const numberFormatter = (x) => {
    if (!x) return;
  
    if (typeof(x) == "number"){
      x = x.toFixed(2)
    }
  
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

export const convertDecimalTimeToMinutes = (d) => {
    var h = Math.floor(d);

    var m = (d - h) * 60;

    var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    var mDisplay = m > 0 ? m.toFixed(0) + (m == 1 ? " min" : " mins") : "";
    // var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay;
}