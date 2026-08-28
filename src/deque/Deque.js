import { Node} from "./Node.js";

/**
 * A double-ended queue (Deque) implementation based on a
 * doubly linked list with sentinel nodes.
 *
 * The deque supports constant-time O(1) insertion and removal
 * from both ends of the structure.
 *
 * Two sentinel nodes are used to simplify boundary operations:
 * - `head`: precedes the first element.
 * - `tail`: follows the last element.
 *
 * An empty deque has the following structure:
 *
 *     head <-> tail
 *
 * A deque containing elements has the following structure:
 *
 *     head <-> A <-> B <-> C <-> tail
 *
 * Sentinel nodes do not represent elements stored in the deque.
 *
 * @class Deque
 */
export class Deque {
    /**
     * Creates an empty deque.
     *
     * @constructor
     */
    constructor() {
        this.head = new Node(0)
        this.tail = new Node(0)
        this._size = 0

        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    /**
     * Inserts an element at the beginning of the deque.
     *
     * Time complexity: O(1).
     *
     * @param {*} value - The value to insert.
     * @returns {void}
     */
    unshift(value) {
        const newNode = new Node(value, this.head.next, this.head);
        
        newNode.prev.next = newNode;
        newNode.next.prev = newNode;

        this._size++;


    }

    /**
     * Removes and returns the first element of the deque.
     *
     * If the deque is empty, no modification is performed and
     * `undefined` is returned.
     *
     * Time complexity: O(1).
     *
     * @returns {*} The removed value, or `undefined` if the deque
     * is empty.
     */
    shift() {
        if (this.empty())
            return undefined;

        const node = this.head.next;

        this.head.next = node.next;
        node.next.prev = this.head;
        this._size--;

        return node.value;
    }

    /**
     * Inserts an element at the end of the deque.
     *
     * Time complexity: O(1).
     *
     * @param {*} value - The value to insert.
     * @returns {void}
     */
    push(value) {
        const newNode = new Node(value, this.tail, this.tail.prev);

        this.tail.prev.next = newNode;
        this.tail.prev = newNode;

        this._size++;   
    }

    /**
     * Removes and returns the last element of the deque.
     *
     * If the deque is empty, no modification is performed and
     * `undefined` is returned.
     *
     * Time complexity: O(1).
     *
     * @returns {*} The removed value, or `undefined` if the deque
     * is empty.
     */
    pop() {
        if (this.empty())
            return undefined;

        const node = this.tail.prev;

        this.tail.prev = node.prev;
        node.prev.next = this.tail; 
        this._size--;

        return node.value;
    }

    /**
     * Checks whether the deque contains no elements.
     *
     * Time complexity: O(1).
     *
     * @returns {boolean} `true` if the deque is empty; otherwise,
     * `false`.
     */
    empty() {
        return this._size === 0;
    }

    /**
     * Gets the number of elements currently stored in the deque.
     *
     * Time complexity: O(1).
     *
     * @returns {number} The number of elements in the deque.
     */
    get size() {
        return this._size;
    }

    /**
     * Gets the value of the last element in the deque.
     *
     * Time complexity: O(1).
     *
     * @returns {*} The last element in the deque.
     */
    get back() {
        return this.tail.prev.value;
    }

    /**
     * Gets the value of the first element in the deque.
     *
     * Time complexity: O(1).
     *
     * @returns {*} The first element in the deque.
     */
    get front() {
        return this.head.next.value;
    }

    /**
     * Returns an array containing all current elements of the deque,
     * preserving the order from front to back.
     * Essential for creting rendering snapshots (frames).
     *
     * Time complexity: O(n), whre n is the number of elements in the deque.
     *
     * @returns {Array} Array containing all elements of the deque.
     */
    toArray() {
        const elements = [];

        let current = this.head.next;

        while (current !== this.tail) {
            elements.push(current.value);
            current = current.next;
        }

        return elements;
    }
}