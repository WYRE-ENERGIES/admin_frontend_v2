// Formats Numbers which are greater than three digits with necessary commas
const numberFormatter = (x) => {
    if (!x) return;
  
    if (typeof(x) == "number"){
      x = x.toFixed(2)
    }
  
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
export { numberFormatter };
  