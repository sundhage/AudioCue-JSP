/*
Copyright (c) 2013, Johan Sundhage (Klevgränd Produktion AB)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/
module AudioCue {
	/**
		Object pool handler. Some objects that are created and deleted very often are held here to prevent garbage collection.
		Number of objects in each pool is static and cannot be altered in runtime. To be able to create a pool of an object type, the
		object type must extend the Poolable base class.
	*/

	 export class PoolController {
	 	private static pools:Pool[] = new Array();

	 	/**
			Creates a new pool of a certain object type.
			@param t Object class
			@param args not used right now
			@count number of objects in pool.
	 	*/
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


	 	/**
			Returns a freed/released object from a pool. If there is no free objects it'll return null
			@param t Object class
	 	*/
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

	 	/**
			Frees an object from pool.
			@param t Object class.
			@param instance Object instance.

	 	*/
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
	 /**
		Internal Pool value object.
	 */
	 export class Pool {
	 	/**
	 		class identifier
	 	*/
	 	cls:any;
	 	/**
	 		linked list of free objects
	 	*/
	 	firstFree:LinkedList;
	 	/**
	 		linked list of busy objects
	 	*/
	 	firstBusy:LinkedList;

	 	/**
	 		hashmap of busy objects (instances) for fast/native retrieving
	 	*/
	 	busyObjects:LinkedList[];
	 }
	 /**
		Linked list value object
	 */
	 export class LinkedList {
	 	/** The actual object instance */
	 	object:Poolable;
	 	/**
		 	pointer to next item
	 	*/
	 	next:LinkedList;
	 	/**
	 		pointer to previous item
	 	*/
	 	prev:LinkedList;
	 }
	 /**
		All classes added to a Pool must extend this class.
	 */
	 export class Poolable {
	 	/**
			unique identifier.
	 	*/
	 	_poolid:number;
	 }
}