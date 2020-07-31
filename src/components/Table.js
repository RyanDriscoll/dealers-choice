import React, { useState } from "react";
import CardsList from "./CardsList";
import { connect } from "react-redux";
import styles from "styles/table.module.scss";
import { getUserIsDealer } from "store/game-store";
import { getTablePiles } from "store/piles-store";
import Deck from "components/Deck";

const Table = ({ piles, userIsDealer }) => {
  return (
    <div id={styles.table} style={{}}>
      {piles.map(({ pileId }) => (
        // <div key={pileId} className={styles.table_space}>
        <CardsList
          locationId={pileId}
          canSelect={true}
          canMove={true}
          collapsed={true}
          tableSpace
        />
        // </div>
      ))}
      <Deck />
    </div>
  );
};

const mapStateToProps = state => ({
  piles: getTablePiles(state),
  userIsDealer: getUserIsDealer(state),
});

export default connect(mapStateToProps)(Table);
