import { Bot } from '../models/bot';
import { Signal } from './constants';
import { getInstruments, getInstrumentUnits } from './instruments';
import { placeOrder } from './orders';
import { getTrades, closeTrade } from './trades';
import {
  extractInputData,
  getIndicatorValues,
  getIndicatorSignal
} from './technical-indicator';

import { sendMail } from '../mailer';

// Calculates a buy/sell/neutral signal for each of the indicators
// and use them together to produce a single signal for the given instrument
export const getInstrumentSignal = (strategy, candles) => {
  let buyTriggers = 0;
  let sellTriggers = 0;

  // prices from oldest to newest
  const prices = extractInputData(candles, ['values']).values;

  strategy.indicators.forEach((indicator) => {
    const tiValues = getIndicatorValues(indicator, candles);

    try {
      const signal = getIndicatorSignal(indicator, tiValues, prices);

      switch (signal) {
        case Signal.BUY:
          buyTriggers++;
          break;
        case Signal.SELL:
          sellTriggers++;
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  });

  // console.log("BuyTriggers", buyTriggers, " - sellTriggers", sellTriggers);

  if (
    buyTriggers >= strategy.minSignals.buy &&
    sellTriggers < strategy.minSignals.sell
  ) {
    return Signal.BUY;
  } else if (
    sellTriggers >= strategy.minSignals.sell &&
    buyTriggers < strategy.minSignals.buy
  ) {
    return Signal.SELL;
  } else {
    // In the case that neither or both BUY and SELL reach the signal threshold.
    return Signal.NEUTRAL;
  }
};

export const calculateBot = async (bot) => {
  const { activeStrategy, chartPeriod, instruments, userAPIkey } = bot;

  try {
    const instrumentsData = await getInstruments(instruments, chartPeriod);

    instrumentsData.forEach(({ candles, instrument }) => {
      // removing last candle if it is not complete
      if (!candles[candles.length - 1].complete) {
        candles.pop();
      }

      // Get instrument signal
      const instrumentSignal = getInstrumentSignal(activeStrategy, candles);

      let units;
      switch (instrumentSignal) {
        case Signal.BUY:
          console.log('[' + instrument + '] BUY SIGNAL!! TO THE MOON!!!');
          units = getInstrumentUnits(
            instrument,
            parseFloat(activeStrategy.lotSize)
          ); // positive lotSize to get BUY order
          sendMail(userAPIkey, { instrument, units, bot });
          placeStrategyOrder(instrument, units, bot); // place order, following trading policy
          break;
        case Signal.SELL:
          console.log('[' + instrument + '] SELL SIGNAL!!');
          units = getInstrumentUnits(
            instrument,
            -parseFloat(activeStrategy.lotSize)
          ); // negative lotSize to get SELL order
          sendMail(userAPIkey, { instrument, units, bot });
          placeStrategyOrder(instrument, units, bot);
          break;
        case Signal.NEUTRAL:
          console.log('[' + instrument + '] NO SIGNAL');
          // WHAT TO DO HERE DEPENDS ON THE POLICY
          break;
        default:
          break;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const calculateBots = async (chartPeriod) => {
  const now = new Date(Date.now());
  console.log(
    '[' + now.getHours() + ':' + now.getMinutes() + '] ' + chartPeriod + ' Bots'
  );

  try {
    // get active bots
    const bots = await getBots({ chartPeriod, live: true });

    bots.forEach((bot) => {
      console.log('[BOT] ' + bot.name);
      calculateBot(bot);
    });
  } catch (error) {
    console.log(error.errorMessage);
  }
};

const filterBotPositions = (trades, openedPositions, instrument) => {
  return trades.filter(({ id, instrument: tradeInstrument }) => {
    return openedPositions.includes(id) && tradeInstrument == instrument;
  });
};

const placeStrategyOrder = async (instrument, units, bot) => {
  const { _id, openedPositions } = bot;

  try {
    // Get BOT opened position
    const { trades } = await getTrades();
    const botPositions = filterBotPositions(
      trades,
      openedPositions,
      instrument
    );

    let closedTrade;
    const closedPositions = [];
    for (let i = 0; i < botPositions.length; i++) {
      if (botPositions[i].currentUnits >= 0 && units < 0) {
        // opened position is BUY, new order is SELL
        closedTrade = await closeTrade(botPositions[i].id);
        closedPositions.push({
          id: closedTrade.orderFillTransaction.id,
          performance: parseFloat(closedTrade.orderFillTransaction.pl)
        });
      } else if (botPositions[i].currentUnits < 0 && units >= 0) {
        // opened position is SELL, new order is BUY
        closedTrade = await closeTrade(botPositions[i].id);
        closedPositions.push({
          id: closedTrade.orderFillTransaction.id,
          performance: parseFloat(closedTrade.orderFillTransaction.pl)
        });
      } else {
        // opened position and new order are of same type, what to do here depends on the strategy : TODO
      }
    }

    // calculate new performance after having closed positions
    let newPerformance = 0;
    for (let i = 0; i < closedPositions.length; i++) {
      // newOpenedPositions.filter((pos) => pos !== closedPositions[i].id); // TODO MAYBE
      newPerformance += closedPositions[i].performance;
    }

    // round to 2 decimal places
    const decimalPlaces = 2;
    newPerformance =
      Math.round(
        (newPerformance + Number.EPSILON) * Math.pow(10, decimalPlaces)
      ) / Math.pow(10, decimalPlaces);
    updateBotPerformance(_id, newPerformance);

    // Place new order and add ID into the bot openedPositions
    const { lastTransactionID } = await placeOrder(instrument, units);
    pushNewOpenedPosition(_id, lastTransactionID);
  } catch (error) {
    console.log(error);
  }
};

export const getBots = async (params = {}): Promise<any[]> => {
  return await Bot.find(params).populate('activeStrategy');
};

const pushNewOpenedPosition = (botId, positionId) => {
  return new Promise((resolve, reject) => {
    Bot.findByIdAndUpdate(
      botId,
      { $push: { openedPositions: positionId } },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

const updateBotPerformance = (botId, variance) => {
  return new Promise((resolve, reject) => {
    Bot.findByIdAndUpdate(
      botId,
      { $inc: { performance: variance } },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

export const updateBot = (id, updateObj) => {
  return new Promise((resolve, reject) => {
    Bot.findByIdAndUpdate(id, { $set: updateObj }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};
