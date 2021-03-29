const CURRENCY_UNIT = 100000; 
const METAL_UNIT = 5000;
const CFD_UNIT = 100;

const Signal = {
	STRONG_SELL: 0,
	SELL: 1,
  NEUTRAL: 2,
  BUY: 3, 
  STRONG_BUY: 4
}

const Comparison = {
  LESS_THAN: 0,
  EQUALS: 1,
  GREATER_THAN: 2,
  CROSS_DOWN: 3,
  CROSS: 4,
  CROSS_UP: 5,
  NO_CROSS: 6
}

module.exports = {
  CURRENCY_UNIT,
  METAL_UNIT,
  CFD_UNIT,
  Signal,
  Comparison,
}