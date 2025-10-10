export function formatPKR(amount){
  const numeric = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numeric);
  return 'Rs ' + formatted;
}


