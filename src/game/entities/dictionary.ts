//TODO Move to server

class TrieNode {
  children: Map<string, TrieNode>;
  isWord: boolean;
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }
}

export default class Dictionary {
  root: TrieNode;
  constructor() {
    this.root = new TrieNode();
  }
  addWord(word: string) {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isWord = true;
  }
  searchWord(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return node.isWord;
  }
}
