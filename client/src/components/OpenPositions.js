import React from 'react';
import uuid from 'react-uuid';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import { Box, IconButton } from '@material-ui/core';
import Title from './Title';

const useStyles = makeStyles((theme) => ({
  noTransactionsText: {
    padding: theme.spacing(4)
  },
}));

export default function OpenPositions({ positions }) {
  const styles = useStyles();

  const closePosition = (id) => {

  }

  const getBUYSELLText = (isBuy) => {
    return (
      <b style={{ backgroundColor: isBuy?"#1bf723":"#de0000", padding: 6, borderRadius: 4, color: "white" }}>{isBuy?"BUY":"SELL"}</b> 
    )
  }

  const getPositionRow = (position) => {

    let pl = parseFloat(position.unrealizedPL);
    return (
      <TableRow key={uuid()}> 
        <TableCell>{ getBUYSELLText(parseInt(position.currentUnits)>0) }</TableCell>
        <TableCell>{position.instrument}</TableCell>
        <TableCell>{position.currentUnits}</TableCell>
        <TableCell>{position.price}</TableCell>
        <TableCell>
          <Typography style={{ marginLeft: 8, fontSize: 20 ,color: pl<0?"#de0000":"#0335fc" }}>{pl.toFixed(2)}</Typography>
        </TableCell>
        <TableCell size="small">
          <Box display="flex" flexDirection="row-reverse">
            <IconButton color="secondary" onClick={() => closePosition(position.id)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  if(!positions || positions.length === 0) {
    return (
      <React.Fragment>
        <Title>Open Positions</Title>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Instrument</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Profit/Loss</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
        </Table>
        <Typography className={styles.noTransactionsText}>No open positions</Typography>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <Title>Open Positions</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Instrument</TableCell>
            <TableCell>Units</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Profit/Loss</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {positions.map((position) => getPositionRow(position))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}