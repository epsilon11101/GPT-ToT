require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const Memory = require("./memory");
const ChatGPT = require("./chatgpt");
const Nodes = require("../three/nodes");

class TOT {
  constructor(puser, K) {
    this.response = null;
    this.puser = puser;
    this.K = K;
    this.bestResult = null;
    this.bestSolution;
    this.memory = new Memory();
    this.chatgpt = new ChatGPT();
    this.nodes = new Nodes();
  }

  #Checker(parentNode) {
    if (!this.response["solutions"]) return null;

    const nextIds = [];
    const expectedResult = 24;

    this.response.solutions.forEach((solution) => {
      const [operation, expectedResultStr] = solution.equation.split("=");
      const actualResult = eval(operation);
      const accuracy = (actualResult * 100) / expectedResult / 100;
      const score = accuracy > 1 ? 0 : accuracy;

      solution.score = score;
      solution["result"] = actualResult;
      const nodeProperties = {
        score,
        equation: operation,
        prev: parentNode.nodeId,
        next: -1,
        edges: {},
        nodes: {},
      };
      console.log(operation, score);
      this.nodes.addNode("", nodeProperties);
      solution["id"] = this.nodes.getLastNode().nodeId;
      nextIds.push(this.nodes.getLastNode().nodeId);
    });
    parentNode.next = nextIds;

    let bestSolution = this.response.solutions.sort(
      (a, b) => b.score - a.score
    )[0];

    bestSolution["isValid"] = bestSolution.result === expectedResult;

    return bestSolution;
  }

  #Controller() {
    const accuracyThreshold = 0.75;
    const bestResult = this.memory.getLastElementAdded();

    if (bestResult && bestResult.score > accuracyThreshold) {
      return {
        system:
          "As an expert mathematics teacher, your job is to solve any kind of mathematical problems accurately and effectively.",
        user: `Given this problem: ${this.puser}.
        please DO NOT USE THESE equation  ${this.memory.getAllEquations()} .
        DO NOT give any explanation.
        the result must be equals to 24, evalute your results.
        you have 3 iterations to solve it.
        come up with 3 different approaches to solve it.
        give each approach a score from 0 to 10 based on how good it is.
        give it to me in JSON FORMAT with these keys: score(contains the score result) , equation: (contains the ecuation), example:
  solutions: [
    { score: 8, equation: '2 * 8 + (14 - 8)' },
    { score: 6, equation: '(8 - 8) * 2 + 14' },
    { score: 10, equation: '(8 / (14 - 8)) * 2' }
  ]
      `,
      };
    }
    return {
      system:
        "You are an expert mathematics teacher, your job is to solve any kind of mathematical problems accurately and effectively.",
      user: `try another solution  to solve the main problem,the result of these ecuations ${this.memory.getAllEquations()} are incorrect, remeber this: 
            you have 3 iterations to solve it.
            DO NOT give any explanation.
        come up with 3 different approaches to solve it.
        give each approach a score from 0 to 10 based on how good it is.
        give it to me in JSON FORMAT with these keys: score(contains the score result) , equation: (contains the ecuation), example:
    give it to me in JSON FORMAT with these keys: score(contains the score result) , equation: (contains the ecuation), example:
  solutions: [
    { score: 8, equation: '2 * 8 + (14 - 8)' },
    { score: 6, equation: '(8 - 8) * 2 + 14' },
    { score: 10, equation: '(8 / (14 - 8)) * 2' }
  ]"`,
    };
  }

  #Prompter() {
    const system =
      "You are an AI who is really good at solving problems. You always think step by step and come up with different approaches to solve a problem";
    const user = `
        Given this problem: ${this.puser}
        you have 3 iterations to solve it.
        come up with 3 different approaches to solve it.
        give each approach a score from 0 to 10 based on how good it is.
        give it to me in JSON FORMAT with these keys: score(contains the score result) , equation: (contains the ecuation), example:
  solutions: [
    { score: 8, equation: '2 * 8 + (14 - 8)' },
    { score: 6, equation: '(8 - 8) * 2 + 14' },
    { score: 10, equation: '(8 / (14 - 8)) * 2' }
  ]
  `;

    return { system, user };
  }

  async #SOLVE() {
    let prompt = this.#Prompter(this.puser);
    this.chatgpt.setPrompt(prompt);
    this.nodes.addNode(prompt, {
      score: 0,
      equation: "",
      prev: -1,
      next: -1,
    });

    let parentNode = this.nodes.getLastNode();

    for (let round = 1; round <= this.K; round++) {
      this.response = await this.chatgpt.LLM();

      this.bestSolution = this.#Checker(parentNode);

      this.memory.store({
        response: this.bestSolution.equation,
        score: this.bestSolution.score,
      });

      if (this.bestSolution?.isValid) {
        console.log("VALID DATA", this.bestSolution);
        return this.memory.getBestResult();
      }

      let ctrl_signal = this.#Controller();
      if (ctrl_signal !== "") {
        prompt = ctrl_signal;
        this.chatgpt.setPrompt(prompt);
        parentNode = this.nodes.getParentNode(this.bestSolution.id);
      }
    }

    return this.memory.getBestResult();
  }

  async getSolution() {
    const finalResult = await this.#SOLVE();
    return finalResult;
  }

  generateToT() {
    const finalThree = this.nodes.list2array();
    const filteredNodes = finalThree.filter(
      (node) => typeof node.next === "object"
    );
    const initialNodes = [];
    const initialEdges = [];
    let y = 0;
    let x = 100;
    let xParentPos = 0;
    let yParentPos = 0;
    //PARENT NODES
    filteredNodes.forEach((node, parentIndex) => {
      if (parentIndex === 0) {
        yParentPos = 0;
      } else if (parentIndex === 1) {
        yParentPos = 450;
      } else {
        yParentPos += 150;
      }

      const customNode = {
        id: node.nodeId,
        position: {
          x: xParentPos,
          y: yParentPos,
        },
        data: {
          label: node.equation === "" ? node.prompt.user : node.equation,
        },
        style: { backgroundColor: "#4FD1C5" },
        isParent: true,
      };

      if (node.prev !== -1) {
        const customEdge = {
          id: `${uuidv4()}`,
          source: node.prev,
          target: node.nodeId,
          animated: true,
        };
        initialEdges.push(customEdge);
      }

      //EDGES && CHILDREN NODES
      node.next.forEach((edge, index) => {
        const customEdge = {
          id: `${uuidv4()}`,
          source: node.nodeId,
          target: edge,
        };
        initialEdges.push(customEdge);

        const childNode = this.nodes.getNodeById(edge);
        let xpos = 0;
        if (index === 0) {
          xpos = customNode.position.x - 450;
        } else if (index === 1) {
          if (customNode.isParent) {
            xpos = -250;

            if (parentIndex >= node.next.length - 1) {
            }
          }
        } else {
          xpos = customNode.position.x + 350;
        }

        let ypos = 0;

        if (customNode.position.y === 0) {
          ypos = 450;
        } else {
          ypos = customNode.position.y + 150;
        }
        const customChildNode = {
          id: childNode.nodeId,
          position: { x: xpos, y: ypos },
          data: {
            label:
              childNode.equation === "" ? node.prompt.user : childNode.equation,
          },
          style: { backgroundColor: "#d25151" },
        };
        initialNodes.push(customChildNode);
      });

      initialNodes.push(customNode);
    });

    const bestNode = this.memory.getBestResult();
    initialNodes
      .filter((node) => node.data.label === bestNode.response)
      .forEach((node) => {
        node.style = { backgroundColor: "#3ec964" };
      });

    return { initialNodes, initialEdges };
  }
}
module.exports = TOT;
