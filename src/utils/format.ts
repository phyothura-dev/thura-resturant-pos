import moment from "moment";

export const formatDate = (date) => {
    if (!date) return '';
  return moment(date).format('MMM DD YYYY');
};

export const formatCurrency = (amount) => {
    if (!amount) return '';
    return amount.toLocaleString();
};


export const formatTime = (date) => {
    if (!date) return '';
    return moment(date).format('HH:mm');
};