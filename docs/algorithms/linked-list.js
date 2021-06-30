
class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

class LinkList {
  constructor() {
    this.head = null
  }

  add(data) {
    if(!this.head) {
      this.head = new Node(data)
    } else {
      let current = this.head
      while (current.next !== null) {
        current = current.next
      }
      current.next = new Node(data)
    }
  }

  prepend(data) {
    if(this.head === null) {
      this.head = new Node(data)
    } else {
      let perHeadNode = this.head
      this.head = new Node(data)
      this.head.next = perHeadNode
    }
  }

  deleteNodeWithValue(data) {
    if(this.head === null) {
      return;
    }

    let prevNode = this.head
    let nextNode = prevNode.next
    if(prevNode.value === data){
      this.head = nextNode
    } else {
      while (nextNode.value !== data && nextNode.value !== null) {
        prevNode = nextNode
        nextNode = nextNode.next
      }
      if(nextNode.value === data) {
        prevNode.next = nextNode.next
      }
    }

  }
}
