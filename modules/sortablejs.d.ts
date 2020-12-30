declare namespace Sortable {
  interface SortableEvent extends Event {
    clone: HTMLElement;
    /**
     * previous list
     */
    from: HTMLElement;
    /**
     * dragged element
     */
    item: HTMLElement;
    /**
     * new index within parent
     */
    newIndex: number | undefined;
    /**
     * old index within parent
     */
    oldIndex: number | undefined;
    target: HTMLElement;
    /**
     * list, in which moved element.
     */
    to: HTMLElement;
    /**
     * Old index within parent, only counting draggable elements
     */
    oldDraggableIndex: number | undefined;
    /**
     * New index within parent, only counting draggable elements
     */
    newDraggableIndex: number | undefined;
    /**
     * Pull mode if dragging into another sortable
     */
    pullMode: "clone" | boolean | undefined;
    /**
     * When MultiDrag is used to sort, this holds a HTMLElement and oldIndex for each item selected.
     *
     * `oldIndicies[number]` is directly related to `newIndicies[number]`
     *
     * If MultiDrag is not used to sort, this array will be empty.
     */
    oldIndicies: { multiDragElement: HTMLElement; index: number }[];
    /**
     * When MultiDrag is used to sort, this holds a HTMLElement and newIndex for each item.
     *
     * `oldIndicies[number]` is directly related to `newIndicies[number]`
     *
     * If MultiDrag is not used to sort, this array will be empty.
     */
    newIndicies: { multiDragElement: HTMLElement; index: number }[];
    /** When Swap is used to sort, this will contain the dragging item that was dropped on.*/
    swapItem: HTMLElement | null;
  }

  interface MoveEvent extends Event {
    dragged: HTMLElement;
    draggedRect: DOMRect;
    from: HTMLElement;
    /**
     * element on which have guided
     */
    related: HTMLElement;
    relatedRect: DOMRect;
    to: HTMLElement;
    willInsertAfter?: boolean;
  }

  type PullResult = ReadonlyArray<string> | boolean | "clone";
  type PutResult = ReadonlyArray<string> | boolean;
  interface GroupOptions {
    /**
     * group name
     */
    name: string;
    /**
     * ability to move from the list. clone — copy the item, rather than move.
     */
    pull?:
      | PullResult
      | ((
          to: Sortable,
          from: Sortable,
          dragEl: HTMLElement,
          event: SortableEvent
        ) => PullResult);
    /**
     * whether elements can be added from other lists, or an array of group names from which elements can be taken.
     */
    put?:
      | PutResult
      | ((
          to: Sortable,
          from: Sortable,
          dragEl: HTMLElement,
          event: SortableEvent
        ) => PutResult);
    /**
     * a canonical version of pull, created by Sortable
     */
    checkPull?: (
      sortable: Sortable,
      activeSortable: Sortable,
      dragEl: HTMLElement,
      event: SortableEvent
    ) => boolean | string | Array<string>;
    /**
     * a canonical version of put, created by Sortable
     */
    checkPut?: (
      sortable: Sortable,
      activeSortable: Sortable,
      dragEl: HTMLElement,
      event: SortableEvent
    ) => boolean | string | "clone" | Array<string>;
    /**
     * revert cloned element to initial position after moving to a another list.
     */
    revertClone?: boolean;
  }

  type Direction = "vertical" | "horizontal";
  interface SortableOptions {
    /**
     * ms, animation speed moving items when sorting, `0` — without animation
     */
    animation?: number;
    /**
     * Class name for the chosen item
     */
    chosenClass?: string;
    dataIdAttr?: string;
    /**
     * time in milliseconds to define when the sorting should start
     */
    delay?: number;
    /**
     * Only delay if user is using touch
     */
    delayOnTouchOnly?: boolean;
    /**
     * Direction of Sortable
     * (will be detected automatically if not given)
     */
    direction?:
      | ((
          evt: SortableEvent,
          target: HTMLElement,
          dragEl: HTMLElement
        ) => Direction)
      | Direction;
    /**
     * Disables the sortable if set to true.
     */
    disabled?: boolean;
    /**
     * Class name for the dragging item
     */
    dragClass?: string;
    /**
     * Specifies which items inside the element should be draggable
     */
    draggable?: string;
    dragoverBubble?: boolean;
    dropBubble?: boolean;
    /**
     * distance mouse must be from empty sortable
     * to insert drag element into it
     */
    emptyInsertThreshold?: number;

    /**
     * Easing for animation. Defaults to null.
     *
     * See https://easings.net/ for examples.
     *
     * For other possible values, see
     * https://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp
     *
     * @example
     *
     * // CSS functions
     * | 'steps(int, start | end)'
     * | 'cubic-bezier(n, n, n, n)'
     *
     * // CSS values
     * | 'linear'
     * | 'ease'
     * | 'ease-in'
     * | 'ease-out'
     * | 'ease-in-out'
     * | 'step-start'
     * | 'step-end'
     * | 'initial'
     * | 'inherit'
     */
    easing?: string;
    /**
     * Class name for the cloned DOM Element when using forceFallback
     */
    fallbackClass?: string;
    /**
     * Appends the cloned DOM Element into the Document's Body
     */
    fallbackOnBody?: boolean;
    /**
     * Specify in pixels how far the mouse should move before it's considered as a drag.
     */
    fallbackTolerance?: number;
    fallbackOffset?: { x: number; y: number };
    /**
     * Selectors that do not lead to dragging (String or Function)
     */
    filter?:
      | string
      | ((
          this: Sortable,
          event: Event | TouchEvent,
          target: HTMLElement,
          sortable: Sortable
        ) => boolean);
    /**
     * ignore the HTML5 DnD behaviour and force the fallback to kick in
     */
    forceFallback?: boolean;
    /**
     * Class name for the drop placeholder
     */
    ghostClass?: string;
    /**
     * To drag elements from one list into another, both lists must have the same group value.
     * You can also define whether lists can give away, give and keep a copy (clone), and receive elements.
     */
    group?: string | GroupOptions;
    /**
     * Drag handle selector within list items
     */
    handle?: string;
    ignore?: string;
    /**
     * Will always use inverted swap zone if set to true
     */
    invertSwap?: boolean;
    /**
     * Threshold of the inverted swap zone
     * (will be set to `swapThreshold` value by default)
     */
    invertedSwapThreshold?: number;
    /**
     * Call `event.preventDefault()` when triggered `filter`
     */
    preventOnFilter?: boolean;
    /**
     * Remove the clone element when it is not showing,
     * rather than just hiding it
     */
    removeCloneOnHide?: boolean;
    /**
     * sorting inside list
     */
    sort?: boolean;
    store?: {
      get: (sortable: Sortable) => string[];
      set: (sortable: Sortable) => void;
    };
    /**
     * Threshold of the swap zone.
     * Defaults to `1`
     */
    swapThreshold?: number;
    /**
     * How many *pixels* the point should move before cancelling a delayed drag event
     */
    touchStartThreshold?: number;

    setData?: (dataTransfer: DataTransfer, draggedElement: HTMLElement) => void;
    /**
     * Element dragging started
     */
    onStart?: (event: SortableEvent) => void;
    /**
     * Element dragging ended
     */
    onEnd?: (event: SortableEvent) => void;
    /**
     * Element is dropped into the list from another list
     */
    onAdd?: (event: SortableEvent) => void;
    /**
     * Created a clone of an element
     */
    onClone?: (event: SortableEvent) => void;
    /**
     * Element is chosen
     */
    onChoose?: (event: SortableEvent) => void;
    /**
     * Element is unchosen
     */
    onUnchoose?: (event: SortableEvent) => void;
    /**
     * Changed sorting within list
     */
    onUpdate?: (event: SortableEvent) => void;
    /**
     * Called by any change to the list (add / update / remove)
     */
    onSort?: (event: SortableEvent) => void;
    /**
     * Element is removed from the list into another list
     */
    onRemove?: (event: SortableEvent) => void;
    /**
     * Attempt to drag a filtered element
     */
    onFilter?: (event: SortableEvent) => void;
    /**
     * Event when you move an item in the list or between lists
     */
    onMove?: (evt: MoveEvent, originalEvent: Event) => boolean | -1 | 1 | void;
    /**
     * Called when dragging element changes position
     */
    onChange?: (evt: SortableEvent) => void;
  }

  interface Options extends SortableOptions {}
}

declare class Sortable {
  /**
   * Creation of new instances.
   * @param element Any variety of HTMLElement.
   * @param options Sortable options object.
   */
  static create(element: HTMLElement, options?: Sortable.Options): Sortable;
}
