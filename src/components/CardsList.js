import React, { useState, useEffect } from "react";
import { functions } from "lib/firebase";
import styles from "styles/cards-list.module.scss";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  userState,
  selectedCardsState,
  cardsStateSelector,
  gameState,
} from "lib/recoil";
import { handleResponse } from "utils/helpers";

const CardsList = ({ locationId, location }) => {
  const { uid: userId } = useRecoilValue(userState);
  const { dealer } = useRecoilValue(gameState);
  const myHand = userId === locationId;
  const isDealer = dealer === locationId;
  const [selectedCards, setSelectedCards] = useRecoilState(selectedCardsState);
  const cards = useRecoilValue(cardsStateSelector({ locationId, location }));

  const selectCard = cardId => {
    if (myHand || location === "pile" || (isDealer && location === "table")) {
      setSelectedCards(selected =>
        selectedCards.some(c => c.cardId === cardId)
          ? selected.filter(c => c.cardId !== cardId)
          : [...selected, { cardId, location, locationId }]
      );
    }
  };

  const getColor = suit => (suit === "H" || suit === "D" ? "red" : "black");

  if (!cards) {
    return null;
  }

  return (
    <ul className={styles.cards_list}>
      {cards.map(({ faceUp, suit, value, cardId }) => {
        const isSelected = selectedCards.some(c => c.cardId === cardId);

        return (
          <li
            style={{ bottom: isSelected ? "10px" : 0 }}
            onClick={() => selectCard(cardId)}
            key={cardId}
            className={styles.card}
          >
            <div className={styles.card_face}>
              <p style={{ color: getColor(suit) }}>
                {faceUp || (myHand && location === "hand")
                  ? `${value} ${suit}`
                  : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default CardsList;
