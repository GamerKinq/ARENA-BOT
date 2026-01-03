module.exports = function aiMove(hp) {
  if (hp < 30) return "defend";
  return Math.random() > 0.5 ? "attack" : "skill";
};