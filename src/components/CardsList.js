import React, { useState, useEffect } from "react";
import { functions } from "lib/firebase";
import styles from "styles/cards-list.module.scss";
import { useRecoilValue, useRecoilState } from "recoil";
import { userState, selectedCardsState, cardsStateSelector } from "lib/recoil";
import { handleResponse } from "utils/helpers";

const CardsList = ({ cards, locationId, location, readOnly, isDealer }) => {
  const { uid: userId } = useRecoilValue(userState);
  const [selectedCards, setSelectedCards] = useRecoilState(selectedCardsState);
  const [inHand, onTable] = useRecoilValue(
    cardsStateSelector({ id: locationId, stateType: location })
  );

  const selectCard = (cardId, isTable) => {
    if (!readOnly || (isTable && isDealer)) {
      if (selectedCards.some(c => c.cardId === cardId)) {
        setSelectedCards(prev => prev.filter(c => c.cardId !== cardId));
      } else {
        setSelectedCards(prev => [...prev, { cardId, location, locationId }]);
      }
    }
  };

  const getColor = suit => (suit === "H" || suit === "D" ? "red" : "black");

  const myHand = locationId === userId;

  const renderCardRow = (cards, isTable) => (
    <ul className={styles.cards_list}>
      {cards.map(({ faceUp, suit, value, cardId }) => {
        const isSelected = selectedCards.some(c => c.cardId === cardId);
        let show = faceUp || myHand;
        if (isTable) {
          show = faceUp;
        }
        return (
          <li
            style={{ bottom: isSelected ? "10px" : 0 }}
            onClick={() => selectCard(cardId, isTable)}
            key={cardId}
            className={styles.card}
          >
            <div className={styles.card_face}>
              <p style={{ color: getColor(suit) }}>
                {show ? `${value} ${suit}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );

  if (!inHand && !onTable) {
    return null;
  }

  return (
    <div className={styles.cards_row}>
      {renderCardRow(inHand)}
      {renderCardRow(onTable, true)}
    </div>
  );
};

export default CardsList;
