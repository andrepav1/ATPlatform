import React from "react";

import {
  Typography,
  Box,
  CardHeader,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import uuid from "react-uuid";
import Title from "./Title";
import Brightness1Icon from "@material-ui/icons/Brightness1";
import { BUY_GREEN, SELL_RED } from "../util/colors";

export default function BotSummary({ bot, positions }) {
  console.log(positions, bot.openedPositions);

  const getBotPositions = () => {
    return positions.filter(({ id }) => {
      return bot.openedPositions.includes(id);
    });
  };

  const getBUYSELLText = (isBuy) => {
    return (
      <b
        style={{
          backgroundColor: isBuy ? BUY_GREEN : SELL_RED,
          padding: 6,
          borderRadius: 4,
          color: "white",
        }}
      >
        {isBuy ? "BUY" : "SELL"}
      </b>
    );
  };

  if (!bot || !positions) {
    return (
      <React.Fragment>
        // @ts-expect-error TS(2322): Type 'Element' is not assignable to type 'ReactNod... Remove this comment to see the full error message
        <Title>{bot.name}</Title>
      </React.Fragment>
    );
  }

  return (
    // @ts-expect-error TS(2746): This JSX tag's 'children' prop expects a single ch... Remove this comment to see the full error message
    <React.Fragment>
      <CardHeader
        title={bot.name}
        subheader={bot.activeStrategy.name + " (" + bot.chartPeriod + ")"}
        titleTypographyProps={{ align: "center" }}
        subheaderTypographyProps={{ align: "center" }}
      />
      <Box
        display="flex"
        flexDirection="row-reverse"
        style={{ position: "relative", bottom: 90 }}
      >
        // @ts-expect-error TS(2322): Type 'Element' is not assignable to type 'ReactNod... Remove this comment to see the full error message
        <Brightness1Icon
          style={{
            color: bot.live ? "#1bf723" : "#de0000",
            position: "absolute",
            fontSize: 14,
          }}
        />
      </Box>
      // @ts-expect-error TS(2746): This JSX tag's 'children' prop expects a single ch... Remove this comment to see the full error message
      <Typography>
        {"Performance since beginning: "}
        <b
          style={{
            fontSize: 18,
            color: parseFloat(bot.performance) < 0 ? "#de0000" : "#0335fc",
          }}
        >
          {(bot.performance.toFixed(2) < 0 ? "" : "+") +
            bot.performance.toFixed(2)}
        </b>
      </Typography>
      // @ts-expect-error TS(2746): This JSX tag's 'children' prop expects a single ch... Remove this comment to see the full error message
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getBotPositions().map((position) => (
              <TableRow key={uuid()}>
                <TableCell>
                  // @ts-expect-error TS(2322): Type 'Element' is not assignable to type 'ReactNod... Remove this comment to see the full error message
                  {getBUYSELLText(parseInt(position.currentUnits) > 0)}
                </TableCell>
                <TableCell>{position.instrument}</TableCell>
                <TableCell>{position.lotSize}</TableCell>
                <TableCell>
                  // @ts-expect-error TS(2322): Type 'Element' is not assignable to type 'ReactNod... Remove this comment to see the full error message
                  <Typography
                    style={{
                      marginLeft: 8,
                      fontSize: 16,
                      color:
                        parseFloat(position.unrealizedPL) < 0
                          ? "#de0000"
                          : "#0335fc",
                    }}
                  >
                    {parseFloat(position.unrealizedPL).toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {getBotPositions().length === 0 && (
          <Typography noWrap style={{ marginTop: 70, color: "#88888888" }}>
            Nothing here
          </Typography>
        )}
      </Box>
    </React.Fragment>
  );
}
