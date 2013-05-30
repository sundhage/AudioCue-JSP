var AudioCue;
(function (AudioCue) {
    var PoolController = (function () {
        function PoolController() { }
        PoolController.pools = new Array();
        PoolController.createPool = function createPool(t, args, count) {
            if(!PoolController.pools[t]) {
                var pool = new Pool();
                pool.busyObjects = new Array();
                pool.cls = t;
                PoolController.pools[t] = pool;
                var llc;
                var llprev;
                var llnext;
                for(var i = 0; i < count; i++) {
                    var obj = new t();
                    obj._poolid = i;
                    llc = new LinkedList();
                    llc.object = obj;
                    llc.next = null;
                    llc.prev = llprev;
                    if(llprev) {
                        llprev.next = llc;
                    }
                    llprev = llc;
                    if(i == 0) {
                        pool.firstFree = llc;
                    }
                }
                return true;
            }
            return false;
        };
        PoolController.getObject = function getObject(t) {
            var pool = PoolController.pools[t];
            if(!pool) {
                return null;
            }
            var f = pool.firstFree;
            if(!f) {
                return null;
            }
            pool.firstFree = f.next;
            f.prev = null;
            if(!pool.firstBusy) {
                f.next = null;
            } else {
                pool.firstBusy.prev = f;
                f.next = pool.firstBusy;
            }
            pool.firstBusy = f;
            pool.busyObjects[f.object._poolid] = f;
            return f.object;
        };
        PoolController.freeObject = function freeObject(t, instance) {
            var ll = PoolController.pools[t].busyObjects[instance._poolid];
            if(!ll) {
                return false;
            }
            PoolController.pools[t].busyObjects[instance._poolid] = null;
            if(ll.prev) {
                ll.prev.next = ll.next;
            }
            if(ll.next) {
                ll.next.prev = ll.prev;
            }
            if(PoolController.pools[t].firstBusy == ll) {
                PoolController.pools[t].firstBusy = ll.next;
            }
            ll.prev = null;
            if(PoolController.pools[t].firstFree) {
                ll.next = PoolController.pools[t].firstFree;
                ll.next.prev = ll;
            } else {
                ll.next = null;
            }
            PoolController.pools[t].firstFree = ll;
            return true;
        };
        return PoolController;
    })();
    AudioCue.PoolController = PoolController;    
    var Pool = (function () {
        function Pool() { }
        return Pool;
    })();
    AudioCue.Pool = Pool;    
    var LinkedList = (function () {
        function LinkedList() { }
        return LinkedList;
    })();
    AudioCue.LinkedList = LinkedList;    
    var Poolable = (function () {
        function Poolable() { }
        return Poolable;
    })();
    AudioCue.Poolable = Poolable;    
})(AudioCue || (AudioCue = {}));
