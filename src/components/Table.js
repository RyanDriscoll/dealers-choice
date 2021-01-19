import React, { useState, useRef } from "react";
import CardsList from "./CardsList";
import { connect } from "react-redux";
import styles from "styles/table.module.scss";
import { getUserIsDealer } from "store/game-store";
import { getTablePiles } from "store/piles-store";
import Deck from "components/Deck";
import { setCoordinatesAction } from "store/app-store";
import Discard from "./Discard";

const Table = ({ piles: { tablePiles, gamePiles } }) => {
  const tableRef = useRef();

  return (
    <div id={styles.table} ref={tableRef}>
      {tablePiles.map(({ pileId, name, coordinates, collapsed, locked }) => (
        <div key={pileId}>
          <CardsList
            key={pileId}
            locationId={pileId}
            canSelectCard={true}
            canMoveCard={true}
            collapsed={collapsed != null ? collapsed : true}
            name={name}
            tableRef={tableRef}
            locked={locked}
          />
        </div>
      ))}
      {/* {gamePiles.map(({ pileId, name, coordinates, collapsed, locked }) => (
        <CardsList
          key={pileId}
          locationId={pileId}
          canSelectCard={true}
          canMoveCard={true}
          collapsed={collapsed != null ? collapsed : true}
          name={name}
          tableRef={tableRef}
          locked={locked}
        />
      ))} */}
      <Deck tableRef={tableRef} />
      <Discard tableRef={tableRef} />
    </div>
  );
};

const mapStateToProps = state => ({
  piles: getTablePiles(state),
  playerOrder: state.players.playerOrder,
  userId: state.user.userId,
});

export default connect(mapStateToProps)(Table);
