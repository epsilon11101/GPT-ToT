const { v4: uuidv4 } = require("uuid");

class Node {
  constructor({ prompt = "", score = 0, equation = "", prev = -1, next = -1 }) {
    this.prompt = prompt;
    this.nodeId = uuidv4();
    this.score = score;
    this.equation = equation;
    this.prev = prev;
    this.next = next;
  }
}

module.exports = Node;
