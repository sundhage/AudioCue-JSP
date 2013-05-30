/*
Copyright (c) 2013 Johan Sundhage (Klevgränd Produktion AB)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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