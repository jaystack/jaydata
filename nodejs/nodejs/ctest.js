var connect = require('connect');
var app = require('connect')();

function Point(n, x, y) {
    this.n = n;
    this.x = x;
    this.y = y;
}

function sumArrayOfPoints(points) {
    var sum = new Point(0, 0, 0);

    for (var i = 0; i < points.length; i++) {
        if ((points[i].n & 1) === 0) {
            sum.x += points[i].x;
            sum.y += points[i].y;
        }
    }

    return sum;
}

function createArrayOfPoints(n) {
    var points = new Array(n);
    for (var i = 0; i < n; i++) {
        points[i] = new Point(/* n */ i, /* x */ i * 0.1 + 0.1, /* y */ i * 0.9 - 0.1);
    }
    return points;
}

function now() {
    return Date.now() * 1000;
}

function assertStrictlyEqual(expected, value) {
  if (expected !== value) {
    throw new Error("Assertion failed: expected " + expected + " got " + value);
  }
}

function testArrayOfPoints() {
    var kArraySize = 10000;
    //var kIterations = 10000;

    var createTotal = 0;
    var sumTotal = 0;

    //for (var i = 0; i < kIterations; i++) {
        var t1 = now();
        var array = createArrayOfPoints(kArraySize);
        var t2 = now();
        var sum = sumArrayOfPoints(array);
        var t3 = now();
        assertStrictlyEqual(2500000, sum.x | 0);
        assertStrictlyEqual(22495000, sum.y | 0);
        assertStrictlyEqual(0, sum.n);

        createTotal += (t2 - t1);
        sumTotal += (t3 - t2);
    //}

    return ("create: " + createTotal + " [" + (createTotal) + " per iteration] usec," +
                " sum: " + sumTotal + " [" + (sumTotal) + " per iteration] usec\n");
}

app.use('/js', function(req, res){
    res.end(testArrayOfPoints());
});

var blocks = [];

function Block(size) {
    this.size = size;
    this.buf = new ArrayBuffer(this.size);
    this.i32 = new Int32Array(this.buf);
    this.f64 = new Float64Array(this.buf);
}

function malloc(N) {
    if (blocks[N] && blocks[N].length) return blocks[N].pop();
    return new Block(N);
}

function free(addr) {
    (blocks[addr.size] || (blocks[addr.size] = [])).push(addr);
}

var $stack = malloc(8 * 1024);
var $sp = 0;

function CcreateArrayOfPoints(n) {
    var points = malloc(24 * n);
    var points_i32 = points.i32;
    var points_f64 = points.f64;
    for (var i1 = 0, i2 = 1, i = 0; i < n; i++, i1 += 6, i2 += 3) {
        points_i32[i1]     = /* n */ i; 
        points_f64[i2]     = /* x */ i * 0.1 + 0.1; 
        points_f64[i2 + 1] = /* y */ i * 0.9 - 0.1;
    }
    return points;
}

function CsumArrayOfPoints(points, n) {
    var x = 0;
    var y = 0;

    var points_i32 = points.i32;
    var points_f64 = points.f64;
    for (var i1 = 0, i2 = 1, k = 6 * n; i1 < k; i1 = i1 + 6, i2 = i2 + 3) {
        if ((points_i32[i1] & 1) === 0) {
            x += points_f64[i2]; 
            y += points_f64[i2 + 1];
        }
    }

    // Caller should have reserved space for the return value.
    var retval_addr = $sp - 24;
    $stack.i32[retval_addr >> 2] = 0;
    $stack.f64[(retval_addr + 8) >> 3] = x;
    $stack.f64[(retval_addr + 16) >> 3] = y;
    return retval_addr;
}

function CtestArrayOfPoints() {
    var kArraySize = 10000;
    //var kIterations = 10000;

    var createTotal = 0;
    var sumTotal = 0;

    //for (var i = 0; i < kIterations; i++) {
        var t1 = now();
        var array = CcreateArrayOfPoints(kArraySize);
        var t2 = now();
        $sp += 24;  // Reserve space for return value on the "stack".
        CsumArrayOfPoints(array, kArraySize);
        $sp -= 24;
        var sum_n = $stack.i32[$sp >> 2];
        var sum_x = $stack.f64[($sp + 8) >> 3];
        var sum_y = $stack.f64[($sp + 16) >> 3];
        var t3 = now();
        assertStrictlyEqual(2500000, sum_x | 0);
        assertStrictlyEqual(22495000, sum_y | 0);
        assertStrictlyEqual(0, sum_n);
        free(array);
        
        createTotal += (t2 - t1);
        sumTotal += (t3 - t2);
    //}

    return ("create: " + createTotal + " [" + (createTotal) + " per iteration] usec," +
                " sum: " + sumTotal + " [" + (sumTotal) + " per iteration] usec\n");
}

app.use('/c', function(req, res){
    res.end(CtestArrayOfPoints());
});

app.listen(3000);
