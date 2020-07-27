import React, { useState, useEffect } from "react";
import styles from "styles/cards-list.module.scss";

import { Droppable, Draggable } from "react-beautiful-dnd";
import { ref } from "lib/firebase";
import { connect } from "react-redux";
import { getSelectedCards, getCards } from "store/cards-store";
import Card from "components/Card";

const CardsList = ({ locationId, userId, gameId, dealer, cards }) => {
  const myHand = userId === locationId;
  const isDealer = dealer === locationId;

  const selectCard = async card => {
    const { cardId } = card;
    if (myHand || isDealer) {
      await ref(`/cards/${gameId}/${cardId}`).update({
        selected: !card.selected,
      });
    }
  };

  if (!cards) {
    return null;
  }

  return (
    <Droppable
      droppableId={locationId}
      type="cards-list"
      direction="horizontal"
    >
      {provided => (
        <ul
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={styles.cards_list}
        >
          {cards.map((card, index) => {
            return (
              <Card
                key={card.cardId}
                card={card}
                index={index}
                selectCard={selectCard}
                myHand={myHand}
              />
            );
          })}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
};

const mapStateToProps = (state, props) => {
  const {
    user: { userId },
    game: { gameId, dealer },
  } = state;
  return {
    userId,
    gameId,
    dealer,
    cards: getCards(state, props),
  };
};

export default connect(mapStateToProps)(CardsList);
