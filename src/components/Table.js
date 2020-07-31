import React, { useState, useRef } from "react";
import CardsList from "./CardsList";
import { connect } from "react-redux";
import styles from "styles/table.module.scss";
import { getUserIsDealer } from "store/game-store";
import { getTablePiles } from "store/piles-store";
import Deck from "components/Deck";
import { setCoordinatesAction } from "store/app-store";

const Table = ({
  piles,
  userIsDealer,
  setCoordinates,
  dragging,
  coordinates,
}) => {
  const tableRef = useRef();
  const handleMouseMove = e => {
    const [x, y] = coordinates;
    const newCoords = [
      e.clientX - tableRef.current.getBoundingClientRect().left,
      e.clientY - tableRef.current.getBoundingClientRect().top,
    ];
    if (
      dragging &&
      (!x ||
        !y ||
        Math.abs(x - newCoords[0]) > 75 ||
        Math.abs(y - newCoords[1]) > 75)
    ) {
      setCoordinates([newCoords[0] - 22.5, newCoords[1] - 37.5]);
    }
  };

  const handleMouseLeave = e => {
    setCoordinates([0, 0]);
  };

  return (
    <div
      id={styles.table}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={tableRef}
    >
      {piles.map(({ pileId, name, coordinates }) => (
        <CardsList
          key={pileId}
          locationId={pileId}
          canSelect={true}
          canMove={true}
          collapsed={true}
          coordinates={coordinates}
          // coordinates={Object.values(pileCoords || { x: 0, y: 0 })}
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
  userIsDealer: getUserIsDealer(state),
  coordinates: state.app.coordinates,
  dragging: state.app.dragging,
});

const mapDispatchToProps = dispatch => ({
  setCoordinates: coords => dispatch(setCoordinatesAction(coords)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Table);
