const Node = require("./node");

class Nodes {
  constructor() {
    this.listOfNodes = {};
  }

  addNode(prompt = "", bestResult) {
    const nodeProperties = {
      prompt,
      score: bestResult.score,
      equation: bestResult.equation,
      prev: bestResult.prev,
      next: bestResult.next,
    };

    const node = new Node(nodeProperties);
    this.listOfNodes[node.nodeId] = node;
  }

  list2array() {
    const list = [];
    Object.keys(this.listOfNodes).forEach((key) => {
      list.push(this.listOfNodes[key]);
    });
    return list;
  }

  getLastNode() {
    const list = this.list2array();
    return list[list.length - 1];
  }

  getParentNode(id) {
    return this.listOfNodes[id];
  }

  getNodeById(id) {
    return this.listOfNodes[id];
  }
}

module.exports = Nodes;
