import React, { useState, useRef } from "react";
import CardsList from "./CardsList";
import { connect } from "react-redux";
import styles from "styles/table.module.scss";
import { getUserIsDealer } from "store/game-store";
import { getTablePiles } from "store/piles-store";
import Deck from "components/Deck";
import { setCoordinatesAction } from "store/app-store";

const Table = ({ piles: { tablePiles, playerPiles, userPile } }) => {
  const tableRef = useRef();

  return (
    <div id={styles.table} ref={tableRef}>
      {tablePiles.map(({ pileId, name, coordinates, collapsed }) => (
        <CardsList
          key={pileId}
          locationId={pileId}
          canSelectCard={true}
          canMoveCard={true}
          collapsed={collapsed != null ? collapsed : true}
          name={name}
          tableRef={tableRef}
          tableSpace
        />
      ))}
      <Deck tableRef={tableRef} />
    </div>
  );
};

const mapStateToProps = state => ({
  piles: getTablePiles(state),
  playerOrder: state.players.playerOrder,
  userId: state.user.userId,
});

export default connect(mapStateToProps)(Table);
