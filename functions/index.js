const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const ref = path =>
  path ? admin.database().ref(path) : admin.database().ref();

exports.createGame = functions.https.onCall(async (data, context) => {
  try {
    const { name, gameName } = data;
    const { uid: playerId } = context.auth;
    const gameRef = ref("/games").push();
    const gameId = gameRef.key;
    await ref().update({
      [`/games/${gameId}/gameId`]: gameId,
      [`/games/${gameId}/name`]: gameName,
      [`/games/${gameId}/dealer`]: playerId,
      [`/players/${gameId}/${playerId}/playerId`]: playerId,
      [`/players/${gameId}/${playerId}/gameId`]: gameId,
      [`/players/${gameId}/${playerId}/name`]: name,
    });
    return { success: true, gameId };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.joinGame = functions.https.onCall(async (data, context) => {
  try {
    const { name, gameId } = data;
    const { uid: playerId } = context.auth;
    const gameSnap = await ref(`games/${gameId}`).once("value");
    if (gameSnap.exists()) {
      await ref(`players/${gameId}/${playerId}`).update({
        playerId,
        gameId,
        name,
      });
      return { success: true, gameId };
    } else {
      return { error: "game does not exist" };
    }
  } catch (error) {
    console.error(error);
    return { error: true };
  }
});

exports.onJoinGame = functions.database
  .ref("/players/{gameId}")
  .onWrite(async ({ before, after }, context) => {
    try {
      const { gameId } = context.params;
      const afterNumChildren = after.numChildren();
      const beforeNumChildren = before.numChildren();
      if (
        after.exists() &&
        afterNumChildren > 1 &&
        afterNumChildren !== beforeNumChildren
      ) {
        const players = [];
        Object.values(after.val()).forEach((originalPlayer, i) => {
          const player = { ...originalPlayer };
          players.push(player);
          if (i > 0) {
            const prevPlayer = players[i - 1];
            prevPlayer.next = player.playerId;
            player.prev = prevPlayer.playerId;
          }
          if (i === afterNumChildren - 1) {
            const firstPlayer = players[0];
            firstPlayer.prev = player.playerId;
            player.next = firstPlayer.playerId;
          }
        });
        const updateObj = {};
        players.forEach(p => {
          updateObj[`/players/${gameId}/${p.playerId}/next`] = p.next;
          updateObj[`/players/${gameId}/${p.playerId}/prev`] = p.prev;
        });
        return ref().update(updateObj);
      }
    } catch (error) {
      console.error(error);
    }
  });

const game = {
  id: "123",
  dealer: "playerId",
  deck: "deckId",
  name: "Championship",
};

const players = {
  abc: {
    gameId: "123",
    nextPlayer: "def",
    prevPlayer: "ghi",
    playerId: "abc",
    name: "Steve McQueen",
  },
  def: {
    gameId: "123",
    nextPlayer: "ghi",
    prevPlayer: "abc",
    playerId: "def",
    name: "Bob McQueen",
  },
  ghi: {
    gameId: "123",
    nextPlayer: "abc",
    prevPlayer: "def",
    playerId: "ghi",
    name: "Jerry McQueen",
  },
};

const hands = {
  "123": {
    abc: [
      { suit: "S", value: "K" },
      { suit: "H", value: "K" },
      { suit: "C", value: "K" },
      { hidden: true },
    ],
    def: [
      { suit: "S", value: "Q" },
      { suit: "H", value: "Q" },
      { suit: "C", value: "Q" },
      { hidden: true },
    ],
    ghi: [
      { suit: "S", value: "A" },
      { suit: "H", value: "A" },
      { suit: "C", value: "A" },
      { hidden: true },
    ],
  },
};

const deck = {
  gameId: "123",
  deckId: "deckId",
  cards: [
    { suit: "S", value: "A" },
    { suit: "H", value: "A" },
    { suit: "C", value: "A" },
    { suit: "S", value: "Q" },
    { suit: "H", value: "Q" },
    { suit: "C", value: "Q" },
    { suit: "S", value: "K" },
    { suit: "H", value: "K" },
    { suit: "C", value: "K" },
  ],
};
