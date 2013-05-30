module AudioCue {
	 export class PoolController {
	 	private static pools:Pool[] = new Array();


	 	static createPool(t:any, args:any[], count:number):bool {
	 		if (!pools[t]) {
	 			var pool:Pool = new Pool;
	 			pool.busyObjects = new Array();
	 			pool.cls = t;
	 			pools[t] = pool;

	 			var llc:LinkedList;
	 			var llprev:LinkedList;
	 			var llnext:LinkedList;

	 			for (var i:number = 0; i<count; i++) {
	 				var obj:Poolable = new t;
	 				// test
	 				obj._poolid = i;
	 				//console.log("creating "+i);
	 				llc = new LinkedList;
	 				llc.object = obj;
	 				llc.next = null;


	 				llc.prev = llprev;
	 				if (llprev) llprev.next = llc;
	 				llprev = llc;
	 				if (i == 0) pool.firstFree = llc;
	 			}
	 			return true;	
	 		}
	 		return false;
	 	}


	 	// should return null if there are no free objects...
	 	static getObject(t:any):any {
	 		var pool:Pool = pools[t];
	 		if (!pool) return null;
	 		var f:LinkedList = pool.firstFree;
	 		if (!f) return null;

	 		// update free list
	 		pool.firstFree = f.next;


	 		// update busy list.
	 		f.prev = null;

	 		if (!pool.firstBusy) {
	 			f.next = null;
	 		} else {
	 			pool.firstBusy.prev = f;
	 			f.next = pool.firstBusy;
	 		}
	 		pool.firstBusy = f;
	 		pool.busyObjects[f.object._poolid] = f;

	 		return f.object;

	 	}

	 	// should move object from busy to free
	 	static freeObject(t:any, instance:Poolable):bool {
	 		var ll:LinkedList = pools[t].busyObjects[instance._poolid];
	 		if (!ll) return false;
	 		pools[t].busyObjects[instance._poolid] = null;

	 		// remove from busy-list
	 		if (ll.prev) {
	 			ll.prev.next = ll.next;
	 		}

	 		if (ll.next) {
 				ll.next.prev = ll.prev;
	 		}


	 		if (pools[t].firstBusy == ll) {
	 			pools[t].firstBusy = ll.next;
	 		}

	 		ll.prev = null;
	 		// add to free
	 		if (pools[t].firstFree) {
	 			ll.next = pools[t].firstFree;
	 			ll.next.prev = ll;

	 		} else {
	 			ll.next = null;

	 		}
			pools[t].firstFree = ll;

	 		return true;
	 	}


	 }

	 export class Pool {
	 	// class identifier
	 	cls:any;
	 	// linked list of free objects
	 	firstFree:LinkedList;
	 	// linked list of busy objects
	 	firstBusy:LinkedList;

	 	// hashmap of busy objects (instances) for fast/native retrieving
	 	busyObjects:LinkedList[];
	 }

	 export class LinkedList {
	 	// the actual instance
	 	object:Poolable;
	 	// ptrs...
	 	next:LinkedList;
	 	prev:LinkedList;
	 }

	 export class Poolable {
	 	_poolid:number;
	 }
}