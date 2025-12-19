const map = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

function nepaliToEnglish(value = "") {
  return value
    .replace(/[०-९]/g, (d) => map[d])
    .replace(/,/g, "")
    .replace(/रू/g, "")
    .trim();
}

module.exports = nepaliToEnglish;
