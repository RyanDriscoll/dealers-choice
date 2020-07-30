import React, { useState } from "react";
import CardsList from "./CardsList";
import { connect } from "react-redux";
import styles from "styles/table.module.scss";
import { getUserIsDealer } from "store/game-store";

const Table = ({ pileData, userIsDealer }) => {
  console.log(`$$>>>>: Table -> pileData`, pileData);
  return (
    <div id={styles.table} style={{}}>
      {Object.values(pileData || {}).map(({ pileId }, i) => (
        <div key={pileId} className={styles.table_space}>
          <CardsList
            locationId={pileId}
            canSelect={userIsDealer}
            canMove={userIsDealer}
          />
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = state => ({
  pileData: state.piles.pileData,
  userIsDealer: getUserIsDealer(state),
});

export default connect(mapStateToProps)(Table);
