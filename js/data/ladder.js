// Escalera de rivales estilo arcade: tu personaje pelea contra los otros 11, de a uno,
// en orden aleatorio, hasta vencerlos a todos.

function buildLadder(players, championId) {
  const opponents = Phaser.Utils.Array.Shuffle(players.filter((p) => p.id !== championId));
  return { championId, opponents, index: 0 };
}

function currentOpponent(ladder) {
  return ladder.opponents[ladder.index];
}

function isLadderComplete(ladder) {
  return ladder.index >= ladder.opponents.length;
}

function advanceLadder(ladder) {
  ladder.index++;
}
