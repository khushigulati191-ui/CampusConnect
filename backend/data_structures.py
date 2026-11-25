"""
Data structures implementation for CampusConnect:
1. FIFO Queue (First-In, First-Out)
2. Priority Queue (Binary Min-Heap) based on severity level with arrival-time tie breaking.
"""

from typing import Any, Dict, List, Optional
import heapq


class FIFOQueue:
    """
    Classic First-In, First-Out (FIFO) Queue implemented using standard list/deque semantics.
    Maintains incoming student complaints strictly in chronological arrival order.
    """

    def __init__(self):
        self._items: List[Dict[str, Any]] = []

    def enqueue(self, item: Dict[str, Any]) -> None:
        """Adds a complaint to the rear of the queue."""
        self._items.append(item)

    def dequeue(self) -> Optional[Dict[str, Any]]:
        """Removes and returns the complaint at the front of the queue."""
        if self.is_empty():
            return None
        return self._items.pop(0)

    def peek(self) -> Optional[Dict[str, Any]]:
        """Returns the front complaint without removing it."""
        if self.is_empty():
            return None
        return self._items[0]

    def is_empty(self) -> bool:
        """Checks if the queue contains no items."""
        return len(self._items) == 0

    def size(self) -> int:
        """Returns the number of complaints in the queue."""
        return len(self._items)

    def to_list(self) -> List[Dict[str, Any]]:
        """Returns a snapshot of the current queue from front to rear."""
        return list(self._items)


class PriorityQueue:
    """
    Binary Min-Heap Priority Queue.
    Dispatches complaints based on urgency/severity level:
      0: Critical
      1: High
      2: Medium
      3: Low
    Ties in urgency are broken by arrival timestamp (oldest first).
    """

    SEVERITY_WEIGHTS = {
        "Critical": 0,
        "High": 1,
        "Medium": 2,
        "Low": 3,
    }

    def __init__(self):
        self._heap: List[tuple] = []
        self._entry_finder: Dict[str, tuple] = {}
        self._counter = 0

    def push(self, complaint: Dict[str, Any], severity: str = "Medium") -> None:
        """
        Pushes a complaint into the min-heap.
        Tuple structure: (severity_rank, arrival_time, sequence_counter, complaint)
        """
        priority = self.SEVERITY_WEIGHTS.get(severity, 2)
        arrival_time = complaint.get("createdAt", "")
        self._counter += 1

        entry = (priority, arrival_time, self._counter, complaint)
        heapq.heappush(self._heap, entry)
        if "id" in complaint:
            self._entry_finder[complaint["id"]] = entry

    def pop(self) -> Optional[Dict[str, Any]]:
        """Pops and returns the highest priority (lowest weight) complaint."""
        if self.is_empty():
            return None
        _, _, _, complaint = heapq.heappop(self._heap)
        if "id" in complaint and complaint["id"] in self._entry_finder:
            del self._entry_finder[complaint["id"]]
        return complaint

    def peek(self) -> Optional[Dict[str, Any]]:
        """Returns the highest priority complaint without removing it."""
        if self.is_empty():
            return None
        return self._heap[0][3]

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def size(self) -> int:
        return len(self._heap)

    def to_list(self) -> List[Dict[str, Any]]:
        """Returns all items ordered by priority."""
        sorted_copy = sorted(self._heap, key=lambda x: (x[0], x[1], x[2]))
        return [entry[3] for entry in sorted_copy]
