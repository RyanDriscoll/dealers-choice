import React, { useState, useEffect } from "react";
import styles from "styles/cards-list.module.scss";
import { useRecoilValue, useRecoilState } from "recoil";
import classnames from "classnames";
import {
  userState,
  selectedCardsState,
  cardsStateSelector,
  gameState,
} from "lib/recoil";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { ref } from "lib/firebase";
import { useUserState } from "context/userContext";
import { connect } from "react-redux";
import { getSelectedCards, getCards } from "store/cards-store";

const CardsList = ({
  locationId,
  location,
  userId,
  gameId,
  dealer,
  selectedCards,
  cards,
}) => {
  // const { userId: userId } = useUserState();
  // const { dealer, gameId } = useRecoilValue(gameState);
  const myHand = userId === locationId;
  const isDealer = dealer === locationId;
  // const selectedCards = useRecoilValue(selectedCardsState);
  // const cards = useRecoilValue(cardsStateSelector({ locationId, location }));

  const selectCard = async card => {
    const { cardId } = card;
    if (myHand || location === "pile" || (isDealer && location === "table")) {
      await ref(`/cards/${gameId}/${cardId}`).update({
        selected: !card.selected,
      });
    }
  };

  const getColor = suit => (suit === "H" || suit === "D" ? "red" : "black");

  if (!cards) {
    return null;
  }

  return (
    <Droppable
      droppableId={`${location}+${locationId}`}
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
            const { faceUp, suit, value, cardId, selected } = card;
            const isSelected =
              selected || (selectedCards && selectedCards.includes(cardId));

            return (
              <Draggable key={cardId} draggableId={cardId} index={index}>
                {provided => (
                  <li
                    ref={provided.innerRef}
                    onClick={() => selectCard(card)}
                    className={classnames(styles.card, {
                      [styles.selected]: isSelected,
                    })}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <div className={styles.card_face}>
                      <p style={{ color: getColor(suit) }}>
                        {faceUp || (myHand && location === "hand")
                          ? `${value} ${suit}`
                          : ""}
                      </p>
                    </div>
                  </li>
                )}
              </Draggable>
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
    selectedCards: getSelectedCards(state),
    cards: getCards(state, props),
  };
};

export default connect(mapStateToProps)(CardsList);
