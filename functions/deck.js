class Deck {
  constructor(customDeck) {
    this.suits = ["C", "S", "H", "D"];
    this.values = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    this.cards = this.createDeck(customDeck);
  }

  createDeck(customDeck) {
    const cards = [];
    if (customDeck) {
      customDeck.forEach(({ suit, value, quantity }) => {
        for (let num = quantity; num > 0; num--) {
          cards.push({ suit, value });
        }
      });
    } else {
      this.suits.forEach(suit => {
        this.values.forEach(value => {
          cards.push({ suit, value });
        });
      });
    }
    return this._shuffle(cards);
  }

  _shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}

module.exports = Deck;
