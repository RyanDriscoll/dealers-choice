import React, { useState } from "react";
import CardsList from "./CardsList";
import { connect } from "react-redux";

const Table = ({ userId, gameId, dealer }) => {
  // const piles = useRecoilValue(pilesState);
  const myDeal = userId === dealer;

  return (
    <div>
      <ul>
        {/* {piles.map(({ pileId, name }, i) => (
          <li key={pileId}>
            <h3>{name}</h3>
            <CardsList
              isDealer={myDeal}
              location={"pile"}
              locationId={pileId}
            />
          </li>
        ))} */}
      </ul>
    </div>
  );
};

const mapStateToProps = ({ user: { userId }, game: { gameId, dealer } }) => ({
  userId,
  gameId,
  dealer,
});

export default connect(mapStateToProps)(Table);
