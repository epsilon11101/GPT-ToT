class Memory {
  constructor() {
    this.memoryStack = [];
  }

  store(result) {
    this.memoryStack.unshift(result);
  }

  // no implemented
  retrieve() {
    return this.memoryStack.pop();
  }

  getAllEquations() {
    const equations = this.memoryStack.map((element) => element.response);
    return equations;
  }
  getLastElementAdded() {
    console.log("--->", this.memoryStack, "<---");
    return this.memoryStack[0];
  }

  getBestResult() {
    return this.memoryStack.sort((a, b) => b.score - a.score)[0];
  }
}

module.exports = Memory;
