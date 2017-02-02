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
var hensa_data = alasql("SELECT id, stock, purpose, state, LEFT(date,10),num FROM trans WHERE stock = " + id + " AND purpose = 2 AND state = 6 AND date >= '" + three_months_ago + "' AND date < '" + this_month + "'");
console.table(hensa_data)
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

