import React, { useState } from "react";
import styles from "styles/cards-list.module.scss";

const CardsList = ({ cards, play, discard }) => {
  const [selected, setSelected] = useState([]);
  const [inHand, onTable] = cards.reduce(
    (acc, curr) => {
      const [iH, oT] = acc;
      if (curr.play) {
        oT.push(curr);
      } else {
        iH.push(curr);
      }
      return [iH, oT];
    },
    [[], []]
  );

  const selectCard = cardId => {
    if (selected.includes(cardId)) {
      setSelected(prev => prev.filter(id => id !== cardId));
    } else {
      setSelected(prev => [...prev, cardId]);
    }
  };

  const getColor = suit => (suit === "H" || suit === "D" ? "red" : "black");

  return (
    <>
      <ul className={styles.cards_list}>
        {inHand.map(({ visible, suit, value, cardId }) => {
          const isSelected = selected.includes(cardId);
          return (
            <li
              style={{ bottom: isSelected ? "10px" : 0 }}
              onClick={() => selectCard(cardId)}
              key={cardId}
              className={styles.card}
            >
              <div className={styles.card_face}>
                {visible && (
                  <h3
                    style={{ color: getColor(suit) }}
                  >{`${value} ${suit}`}</h3>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <ul className={styles.cards_list}>
        {onTable.map(({ visible, suit, value, cardId }) => {
          const isSelected = selected.includes(cardId);
          return (
            <li
              style={{ bottom: isSelected ? "10px" : 0 }}
              onClick={() => selectCard(cardId)}
              key={cardId}
              className={styles.card}
            >
              <div className={styles.card_face}>
                {visible && (
                  <h3
                    style={{ color: getColor(suit) }}
                  >{`${value} ${suit}`}</h3>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CardsList;
