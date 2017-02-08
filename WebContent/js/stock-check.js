// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 商品情報読み込み
var sql = 'SELECT * FROM trans \
		JOIN stock ON stock.id = trans.stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		JOIN kind ON kind.id = item.kind \
		WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];
$('#leadtime').text(row.item.leadtime + ' 日');
$('#lack').text(row.item.lack + ' %');

//現在の在庫数
//入庫数読み込み
var in_13_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 3', [ id ])[0];
var in_13 = in_13_sql["SUM(num)"]; //入庫済み
var in_19_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 9', [ id ])[0];
var in_19 = in_19_sql["SUM(num)"]; //棚卸(過剰)数：値はマイナスで保持

//出庫数読み込み
var out_26_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 6', [ id ])[0];
var out_26 = out_26_sql["SUM(num)"]; //出庫済み
var out_27_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 7', [ id ])[0];
var out_27 = out_27_sql["SUM(num)"]; //返品数
var out_28_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 8', [ id ])[0];
var out_28 = out_28_sql["SUM(num)"]; //棚卸(不足)数

//パンくずリスト商品名追加
var bread_rows = alasql('SELECT * FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE stock.id = ?', [ id ])[0];
var this_bread_name = "(倉庫) " + bread_rows.whouse.name + "　(品番) " + bread_rows.item.maker + " : " + bread_rows.item.detail;
$('#this_bread').text(this_bread_name);

//在庫数吐き出し
var warehouse_stock = in_13 - in_19 - out_26 + out_27 - out_28; //在庫数(倉庫内在庫)
$("#current_stock_data").append(numberWithCommas(warehouse_stock));

//日付を取得
var y = 0;
var this_month = "";
var three_months_ago = "";
$(function(){
	var time = $.now();
	var dateObj = new Date(time);
		y = dateObj.getFullYear();
	var m = dateObj.getMonth() + 1;
		if(m<10){m = "0" + m}
	this_month = y + '-' + m + '-01 00:00';
	
	if (m<=3){
		var y3 = parseInt(y) - 1;
		var m3 = parseInt(m) + 9;
	}
	else{
		y3 = y;
		m3 = m -3;
	}
	three_months_ago = y3 + '-' + m3 + '-01 00:00';
})

//標準偏差
var hensa_data_test = alasql("SELECT * FROM trans WHERE stock = " + id + " AND purpose = 2 AND state = 6");
console.table(hensa_data_test)


//SQL 日付の取り出し調べる

var hensa_box = [];




$(function(){
//標準偏差：平均
function getAverage(hensa_box){
	var sum = 0;
	var average = -1;
	for(var i=0; i<hensa_box.length; i++){
		sum += hensa_box[i];
	}
	average = sum / hensa_box.length;
	return average;
}

//標準偏差：分散
function getVariance(hensa_box){
	var average = getAverage(hensa_box);
	var variance = -1;
	var sum = 0;
	for (var i=0; i<hensa_box.length; i++){
		sum += Math.pow((hensa_box[i] - average), 2);
	}
	variance = sum / hensa_box.length;
	return variance;
}

//標準偏差(分散のルート)
function getStandardDeviation(hensa_box){
	var variance = getVariance(hensa_box);
	var standardDeviation = Math.sqrt(variance);
	return standardDeviation;
}

var hensa = getStandardDeviation(hensa_box);
//四捨五入
function floatFormat(number){
	var _pow = Math.pow(10, 2);
	return Math.round(number * _pow) / _pow;
}
var hensa_float = floatFormat(hensa);
$("#hensa").append(hensa_float);
})


//ここから未編集
//-------------------------------------
// Correlation
//-------------------------------------
  var df1;
  var NMAX = 500;                // max.# of data
  var xx = new Array(NMAX);      // x
  var yy = new Array(NMAX);      // y
  var n = 0;
  var xpos, ypos;

  var g, w=500, h=500, maxS=10;

//..........................
  function calc() {
//..........................
    var sumx = 0;
    var sumy = 0;
    var sumxx = 0;
    var sumyy = 0;
    var sumxy = 0;

    for(var i=0; i<n; i++){
      sumx += xx[i];
      sumy += yy[i];
      sumxx += xx[i]*xx[i];
      sumyy += yy[i]*yy[i];
      sumxy += xx[i]*yy[i];
    }

    var xm = sumx/n;
    var ym = sumy/n;
    var sumxxm = 0;
    var sumyym = 0;
    var sumxym = 0;

    for(var i=0; i<n; i++) {
      var xxi = xx[i];
      var yyi = yy[i];
      sumxxm += (xxi-xm)*(xxi-xm);
      sumyym += (yyi-ym)*(yyi-ym);
      sumxym += (xxi-xm)*(yyi-ym);
    }

    var r = sumxym/Math.sqrt(sumxxm)/Math.sqrt(sumyym);
    var r2 = r*r;
    df1.tfCC.value = formatN(r);
    df1.tfR2.value = formatN(r2);

// y = ax+b
    var a = (n*sumxy-sumx*sumy)/(n*sumxx-sumx*sumx);
    var b = (sumxx*sumy-sumxy*sumx)/(n*sumxx-sumx*sumx);
    dispLine(a, b, "red");
    var s = "xからyへの回帰直線　（y = a1*x+b1）：　";
    if(b > 0) s += "y = "+formatN(a)+" x + "+formatN(b);
    else      s += "y = "+formatN(a)+" x - "+formatN(-b);

    g.fillStyle = "red";
    g.fillText(s, dx, h-dy/3);
// x = ay+b ---> y = (1/a)x-(b/a)
    a = (n*sumxy-sumx*sumy)/(n*sumyy-sumy*sumy);
    b = (sumyy*sumx-sumxy*sumy)/(n*sumyy-sumy*sumy);
    dispLine(1./a, -b/a, "blue");
    var s = "yからxへの回帰直線　（x = a2*y+b2）：　";
    if(b > 0) s += "x = "+formatN(a)+" y + "+formatN(b);
    else      s += "x = "+formatN(a)+" y - "+formatN(-b);

    g.fillStyle = "blue";
    g.fillText(s, dx, h-2);
  }

//..........................
  function clearD(sw) {
//..........................
    if(sw == 0) {
      n = 0;
    }else {
      if(n > 0) n--;
    }

    disp();
  }

//..........................
  function clearGraph() {
//..........................
    g.fillStyle = "white";
    g.fillRect(1, 1, w-2, h-2);
}

//..........................
  function disp() {
//..........................
    dx = w/10; dy = h/10;
    x0 = w/2; y0 = h/2; w1 = w - 2*dx; h1 = h - 2*dy;

    clearGraph();
    df1.tfN.value = n;
    g.font = "12px sans-serif";

    g.lineWidth = .5;
    g.fillStyle = "black";
    g.fillText("x", w-dx+5, y0);
    g.fillText("y", x0, dy-5);
    g.strokeStyle = "gray";


    for(i=-maxS; i<=maxS; i++) {
      x = x0 + w1*i/maxS/2;
      g.beginPath();
      g.moveTo(x, dy);
      g.lineTo(x, h-dy);
      g.stroke();
      if(i%maxS == 0) g.fillText(""+i, x-5, h-dy+15);
    }

    for(i=-maxS; i<=maxS; i++) {
      y = y0 - h1*i/maxS/2;
      g.beginPath();
      g.moveTo(dx, y);
      g.lineTo(w-dx, y);
      g.stroke();
      if(i%maxS == 0) g.fillText(""+i, dx-20, y+5);
    }

    g.strokeStyle = "black";
    g.beginPath();
    g.rect(dx, dy, w1, h1);
    g.rect(dx, y0, w1, h1/2);
    g.rect(x0, dy, w1/2, h1);
    g.stroke();

    g.fillStyle = "blue";
    g.beginPath();

    for(i=0; i<n; i++) {
      x = x0 + w1/2*xx[i]/maxS;
      y = y0 - h1/2*yy[i]/maxS;
      g.fillRect(x-1, y-1, 3, 3);
      if(i == n-1) {
        g.fillText("x = "+formatN(xx[i])+"  y = "+formatN(yy[i]), w*3/5, dy/2);
      }
    }
    g.stroke();

    if(n > 2) calc();
  }

//.............................
  function dispLine(a, b, c) {
//.............................
    var x1 = dx, y1 = dy, x2 = w - dx, y2 = h - dy;
    var NN = maxS*2;
    var xleft = -NN*w/2/(x2 - x1);
    var yleft = a*xleft + b;

    b =  yleft*(y2 - y1)/NN - y0;
    a = a*(y2 - y1)/(x2 - x1);

    var xs = x1;
    var ys = -(a*xs + b);
    var xe = x2;
    var ye = -(a*xe + b);

    if(a > 0) {
      if(ys > y2) {
        ys = y2;
        xs = (-ys-b)/a;
      }
      if(ye < y1) {
        ye = y1;
        xe = (-ye-b)/a;
      }

    }else {
      if(ys < y1) {
        ys = y1;
        xs = (-ys-b)/a;
      }
      if(ye > y2) {
        ye = y2;
        xe = (-ye-b)/a;
      }
    }

    g.strokeStyle = c;
    g.beginPath();
    g.moveTo(xs, ys);
    g.lineTo(xe, ye);
    g.stroke();
  }

//....................................
  function formatN(v) { // xxxx.xxxxxx
//....................................
    var a = Math.round(v*1000000);
    return a/1000000;
  }

//..........................
  function getPos(e) {
//..........................
    rect = e.target.getBoundingClientRect();
    cx = e.clientX - rect.left;
    cy = e.clientY - rect.top;
    xpos =  maxS*(cx - w/2)/(w1/2);
    ypos = -maxS*(cy - h/2)/(h1/2);
  }

//..........................
  function loadCanvas() {
//..........................
    df1 = document.form1;

    var canvas = document.getElementById("canvas");
    if(!canvas.getContext) {
      alert("not supported");
      return;
    }

    g = canvas.getContext("2d");

    canvas.addEventListener("mousedown" , mousePressed);
//  canvas.addEventListener("mousemove" , mouseMoved);
    disp();
  }

//..........................
  function mousePressed(e) {
//..........................
    getPos(e);

    if(n >= NMAX) return;

    xx[n] = xpos;
    yy[n] = ypos;
    n++;
    disp();
  }


