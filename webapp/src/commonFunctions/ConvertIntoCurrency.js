
// convert into currency
export const formatCurrency = (value, currencySymbol = 'USD') => {
    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencySymbol,
            minimumFractionDigits: 0
        });
        const parts = formatter.formatToParts(numberValue);
        // Extract currency symbol
        const extractedCurrencySymbol = parts.find(part => part.type === 'currency').value;
        const formattedValue = parts
            .filter(part => part.type !== 'currency')
            .map(part => part.value)
            .join('');
        return `${extractedCurrencySymbol}${formattedValue}`;
    } else {
        // If the value is not a valid number, return an empty string
        return '';
    }
};