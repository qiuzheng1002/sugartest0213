// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);
$("#zaiko_shosai").append("<a href = stock-check.html?id=" + id + " style='float:right;'>在庫数の詳細はこちら</a>");
$("#nyuuko_shosai").append("<a href = stock-in.html?id=" + id + " style='float:right;'>発注・入庫データの登録・詳細はこちら</a>");
$("#shukko_shosai").append("<a href = stock-out.html?id=" + id + " style='float:right;'>受注・出庫データの登録、詳細はこちら</a>");

// 商品情報読み込み
var sql = 'SELECT * \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];
$('#image').attr('src', 'img/' + row.item.id + '.jpg');
$('#whouse').text(row.whouse.name);
$('#code').text(row.item.code);
$('#maker').text(row.item.maker);
$('#detail').text(row.item.detail);
$('#price').text(numberWithCommas(row.item.price) + ' 円');
$('#leadtime').text(row.item.leadtime + ' 日');
$('#lack').text(row.item.lack + ' %');

/* 一覧表：ボツ
// トランザクション読み込み
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-transs');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>' + row.trans.date + '</td>');
	if (row.trans.order_wh === 0){
		tr.append('<td style="color: #FFFFFF;">' + row.trans.order_wh + '</td>');}
	else {
		tr.append('<td>' + row.trans.order_wh + '</td>');}
	if (row.trans.in_wh === 0){
		tr.append('<td style="color: #FFFFFF;">' + row.trans.in_wh + '</td>');}
	else {
		tr.append('<td>' + row.trans.in_wh + '</td>');}
	if (row.trans.out_wh === 0){
		tr.append('<td style="color: #FFFFFF;">' + row.trans.out_wh + '</td>');}
	else {
		tr.append('<td>' + row.trans.out_wh + '</td>');}
	tr.append('<td>' + row.trans.memo + '</td>');
	tr.append('<td class="text-right"><button type="button" class="btn btn-xs" id="delete_data_address" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
}
*/

//入庫数読み込み
var in_11_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 1', [ id ])[0];
var in_11 = in_11_sql["SUM(num)"]; //未発注
var in_12_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 2', [ id ])[0];
var in_12 = in_12_sql["SUM(num)"]; //発注済
var in_13_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 3', [ id ])[0];
var in_13 = in_13_sql["SUM(num)"]; //入庫済み

//出庫数読み込み
var out_24_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 4', [ id ])[0];
var out_24 = out_24_sql["SUM(num)"]; //受注済み
var out_25_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 5', [ id ])[0];
var out_25 = out_25_sql["SUM(num)"]; //納期回答済み
var out_26_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 6', [ id ])[0];
var out_26 = out_26_sql["SUM(num)"]; //出庫済み

//在庫数吐き出し
var warehouse_stock = in_13 - out_26; //倉庫内在庫
var mikomi_stock = warehouse_stock + in_11 + in_12 - out_24 - out_25; //見込み在庫
var safe_stock = 17000; //安全在庫数
var diff_stock = mikomi_stock - safe_stock; //見込み在庫 - 安全在庫
var percent_stock = mikomi_stock / safe_stock * 100; //ステータス(%)
function floatFormat(number){
	var _pow = Math.pow(10, 0);
	return Math.round(number * _pow) / _pow;
}
var percent_stock_float = floatFormat(percent_stock); //ステータス(%)四捨五入
var tbody_zaiko_state = $('#tbody-zaiko_state');
var tr = $('<tr>').appendTo(tbody_zaiko_state);
	tr.append('<td>' + mikomi_stock + '</td>');
	tr.append('<td>' + warehouse_stock + '</td>');
	tr.append('<td>' + safe_stock + '</td>');
	tr.append('<td>' + diff_stock + '</td>');
	if (percent_stock_float > 130){ //在庫131%～：赤
	tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: 100%;">' + percent_stock_float + '%</div></div> </td>');
	}
	else if (percent_stock_float <= 130 && percent_stock_float > 110){ //在庫111～130：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: 100%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else if (percent_stock_float <= 110 && percent_stock_float >= 100){ //在庫100～110：緑
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" style="width: 100%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else if (percent_stock_float < 100 && percent_stock_float >= 50){ //在庫50～99：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: ' + percent_stock_float + '%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else { //在庫～49：赤
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: ' + percent_stock_float + '%;">' + percent_stock_float + '%</div></div> </td>');
		}
	
//入庫済み累積
$("#nyuuko_total").append(in_13);

//出庫済み累積
$("#shukko_total").append(out_26);

//発注・入庫手配中
var tbody_nyuuko_state = $('#tbody-nyuuko_state');
var tr = $('<tr>').appendTo(tbody_nyuuko_state);
tr.append('<td>' + in_11 + '</td>');
tr.append('<td>' + in_12 + '</td>');

//受注・出庫手配中
var tbody_shukko_state = $('#tbody-shukko_state');
var tr = $('<tr>').appendTo(tbody_shukko_state);
tr.append('<td>' + out_24 + '</td>');
tr.append('<td>' + out_25 + '</td>');




/* ボツ
var order_total = alasql('SELECT SUM(order_wh) FROM trans WHERE stock = ?', [ id ])[0];
var in_total = alasql('SELECT SUM(in_wh) FROM trans WHERE stock = ?', [ id ])[0];
var out_total = alasql('SELECT SUM(out_wh) FROM trans WHERE stock = ?', [ id ])[0];
var order_total_j = order_total["SUM(order_wh)"];
var in_total_j = in_total["SUM(in_wh)"];
var out_total_j = out_total["SUM(out_wh)"];
var yet_out_j = order_total_j - out_total_j;
var zaiko_j = in_total_j - out_total_j;
var tbody_zaiko = $('#tbody-zaiko_table');
var tr = $('<tr>').appendTo(tbody_zaiko);
	tr.append('<td>' + zaiko_j + '</td>');
	tr.append('<td>' + order_total_j + '</td>');
	tr.append('<td>' + in_total_j + '</td>');
	tr.append('<td>' + out_total_j + '</td>');
	tr.append('<td>' + yet_out_j + '</td>');
*/

	//変更
//受注処理
$('#update_order').on('click', function() {
	var date = $('input[name="date1"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	if (month_check == 1 || month_check == 3 || month_check == 5 || month_check == 7 || month_check == 8 || month_check == 10 || month_check == 12){
		var lastdate_check = 31;
		var lastmonth_check = month_check;
	}
	else {
		var lastdate = new Date(date);
			lastdate.setMonth(lastdate.getMonth() + 1);
			lastdate.setDate(0);
		var lastdate_check = lastdate.getDate();
		var lastmonth_check = lastdate.getMonth() + 1;
	}

	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
		$("#order-form_date").css("color","black");
		var order_wh = parseInt($('input[name="order_wh"]').val());
		var order_wh2 = $('input[name="order_wh"]').val();
		var order_wh_check = order_wh - order_wh2;
		if (order_wh_check === 0 && order_wh > 0 && order_wh < 1000000){
			$("#order-form_number").css("color","black");
			var in_wh = 0;
			var out_wh = 0;
			var memo = $('input[name="memo1"]').val();
			alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + order_wh, id ]);
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
			window.location.assign('stock.html?id=' + id);
		}
		else {
			$("#order-form_number").css("color","red");
			$("#order-form_number").animate({opacity: 0.4},50);
			$("#order-form_number").animate({opacity: 1.0},50);
			$("#order-form_number").animate({opacity: 0.4},50);
			$("#order-form_number").animate({opacity: 1.0},50);
		}
	}
	else{
		$("#order-form_date").css("color","red");
		$("#order-form_date").animate({opacity: 0.4},50);
		$("#order-form_date").animate({opacity: 1.0},50);
		$("#order-form_date").animate({opacity: 0.4},50);
		$("#order-form_date").animate({opacity: 1.0},50);
	}
});
//変更
//入庫処理
$('#update_in').on('click', function() {
	var date = $('input[name="date2"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	if (month_check == 1 || month_check == 3 || month_check == 5 || month_check == 7 || month_check == 8 || month_check == 10 || month_check == 12){
		var lastdate_check = 31;
		var lastmonth_check = month_check;
	}
	else {
		var lastdate = new Date(date);
			lastdate.setMonth(lastdate.getMonth() + 1);
			lastdate.setDate(0);
		var lastdate_check = lastdate.getDate();
		var lastmonth_check = lastdate.getMonth() + 1;
	}

	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
		$("#in-form_date").css("color","black");
		var in_wh = parseInt($('input[name="in_wh"]').val());
		var in_wh2 = $('input[name="in_wh"]').val();
		var in_wh_check = in_wh - in_wh2;
		if (in_wh_check === 0 && in_wh > 0 && in_wh < 1000000){
			$("#in-form_number").css("color","black");
			var order_wh = 0;
			var out_wh = 0;
			var memo = $('input[name="memo2"]').val();
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
			window.location.assign('stock.html?id=' + id);
		}
		else {
			$("#in-form_number").css("color","red");
			$("#in-form_number").animate({opacity: 0.4},50);
			$("#in-form_number").animate({opacity: 1.0},50);
			$("#in-form_number").animate({opacity: 0.4},50);
			$("#in-form_number").animate({opacity: 1.0},50);
		}
	}
	else{
		$("#in-form_date").css("color","red");
		$("#in-form_date").animate({opacity: 0.4},50);
		$("#in-form_date").animate({opacity: 1.0},50);
		$("#in-form_date").animate({opacity: 0.4},50);
		$("#in-form_date").animate({opacity: 1.0},50);
	}
});
//変更
//出庫処理
$('#update_out').on('click', function() {
	var date = $('input[name="date3"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	if (month_check == 1 || month_check == 3 || month_check == 5 || month_check == 7 || month_check == 8 || month_check == 10 || month_check == 12){
		var lastdate_check = 31;
		var lastmonth_check = month_check;
	}
	else {
		var lastdate = new Date(date);
			lastdate.setMonth(lastdate.getMonth() + 1);
			lastdate.setDate(0);
		var lastdate_check = lastdate.getDate();
		var lastmonth_check = lastdate.getMonth() + 1;
	}

	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
		$("#out-form_date").css("color","black");
		var out_wh = parseInt($('input[name="out_wh"]').val());
		var out_wh2 = $('input[name="out_wh"]').val();
		var out_wh_check = out_wh - out_wh2;
		if (out_wh_check === 0 && out_wh > 0 && out_wh < 1000000){
			$("#out-form_number").css("color","black");
			var order_wh = 0;
			var in_wh = 0;
			var memo = $('input[name="memo3"]').val();
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
			window.location.assign('stock.html?id=' + id);
		}
		else {
			$("#out-form_number").css("color","red");
			$("#out-form_number").animate({opacity: 0.4},50);
			$("#out-form_number").animate({opacity: 1.0},50);
			$("#out-form_number").animate({opacity: 0.4},50);
			$("#out-form_number").animate({opacity: 1.0},50);
		}
	}
	else{
		$("#out-form_date").css("color","red");
		$("#out-form_date").animate({opacity: 0.4},50);
		$("#out-form_date").animate({opacity: 1.0},50);
		$("#out-form_date").animate({opacity: 0.4},50);
		$("#out-form_date").animate({opacity: 1.0},50);
	}
});
//変更
//返品処理
$('#update_return').on('click', function() {
	var date = $('input[name="date4"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	if (month_check == 1 || month_check == 3 || month_check == 5 || month_check == 7 || month_check == 8 || month_check == 10 || month_check == 12){
		var lastdate_check = 31;
		var lastmonth_check = month_check;
	}
	else {
		var lastdate = new Date(date);
			lastdate.setMonth(lastdate.getMonth() + 1);
			lastdate.setDate(0);
		var lastdate_check = lastdate.getDate();
		var lastmonth_check = lastdate.getMonth() + 1;
	}

	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
		$("#return-form_date").css("color","black");
		var return_wh = parseInt($('input[name="return_wh"]').val());
		var return_wh2 = $('input[name="return_wh"]').val();
		var return_wh_check = return_wh - return_wh2;
		if (return_wh_check === 0 && return_wh > 0 && return_wh < 1000000){
			$("#return-form_number").css("color","black");
			var order_wh = -1 * return_wh;
			var in_wh = return_wh;
			var out_wh = -1 * return_wh;
			var memo = $('input[name="memo4"]').val() + "より返品";
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
			window.location.assign('stock.html?id=' + id);
		}
		else {
			$("#return-form_number").css("color","red");
			$("#return-form_number").animate({opacity: 0.4},50);
			$("#return-form_number").animate({opacity: 1.0},50);
			$("#return-form_number").animate({opacity: 0.4},50);
			$("#return-form_number").animate({opacity: 1.0},50);
		}
	}
	else{
		$("#return-form_date").css("color","red");
		$("#return-form_date").animate({opacity: 0.4},50);
		$("#return-form_date").animate({opacity: 1.0},50);
		$("#return-form_date").animate({opacity: 0.4},50);
		$("#return-form_date").animate({opacity: 1.0},50);
	}
});
//変更
//棚卸し処理
$('#update_check').on('click', function() {
	var date = $('input[name="date5"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	if (month_check == 1 || month_check == 3 || month_check == 5 || month_check == 7 || month_check == 8 || month_check == 10 || month_check == 12){
		var lastdate_check = 31;
		var lastmonth_check = month_check;
	}
	else {
		var lastdate = new Date(date);
			lastdate.setMonth(lastdate.getMonth() + 1);
			lastdate.setDate(0);
		var lastdate_check = lastdate.getDate();
		var lastmonth_check = lastdate.getMonth() + 1;
	}

	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
		$("#check-form_date").css("color","black");
		var check_wh = parseInt($('input[name="check_wh"]').val());
		var check_wh2 = $('input[name="check_wh"]').val();
		var check_wh_check = check_wh - check_wh2;
		if (check_wh_check === 0 && check_wh > -1000000 && check_wh < 1000000){
			$("#check-form_number").css("color","black");
			var order_wh = 0;
			var in_wh = check_wh;
			var out_wh = 0;
			var memo = "棚卸し";
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
			window.location.assign('stock.html?id=' + id);
		}
		else {
			$("#check-form_number").css("color","red");
			$("#check-form_number").animate({opacity: 0.4},50);
			$("#check-form_number").animate({opacity: 1.0},50);
			$("#check-form_number").animate({opacity: 0.4},50);
			$("#check-form_number").animate({opacity: 1.0},50);
		}
	}
	else{
		$("#check-form_date").css("color","red");
		$("#check-form_date").animate({opacity: 0.4},50);
		$("#check-form_date").animate({opacity: 1.0},50);
		$("#check-form_date").animate({opacity: 0.4},50);
		$("#check-form_date").animate({opacity: 1.0},50);
	}
});

//要移設
//本日の日付を自動入力
var y = 0;
$(function(){
	var time = $.now();
	var dateObj = new Date(time);
		y = dateObj.getFullYear();
	var m = dateObj.getMonth() + 1;
		if(m<10){m = "0" + m}
	var d = dateObj.getDate();
		if(d<10){d = "0" + d}
	var h = dateObj.getHours();
		if(h<10){h = "0" + h}
	var min = dateObj.getMinutes();
		if(min<10){min = "0" + min}
	var select_d = y + '-' + m + '-' + d + ' ' + h + ':' + min;
	$("#selected_date1").attr("value", select_d);
	$("#selected_date2").attr("value", select_d);
	$("#selected_date3").attr("value", select_d);
	$("#selected_date4").attr("value", select_d);
	$("#selected_date5").attr("value", select_d);
	
	var y_limit = dateObj.getFullYear() + 1;
	$("#order-form_year").append("<span> (登録可能期間 ： 2010-01-01 00:00 ～ " + y_limit +"-12-31 23:59)</span>");
	$("#in-form_year").append("<span> (登録可能期間 ： 2010-01-01 00:00 ～ " + y_limit +"-12-31 23:59)</span>");
	$("#out-form_year").append("<span> (登録可能期間 ： 2010-01-01 00:00 ～ " + y_limit +"-12-31 23:59)</span>");
	$("#return-form_year").append("<span> (登録可能期間 ： 2010-01-01 00:00 ～ " + y_limit +"-12-31 23:59)</span>");
	$("#check-form_year").append("<span> (登録可能期間 ： 2010-01-01 00:00 ～ " + y_limit +"-12-31 23:59)</span>");
});

//変更履歴：削除する行の設定
var dd_address="";
$(function(){
	$(document).on("click","#delete_data_address",function() {
		dd_address = $(this).parent().parent();
	});
});
//変更履歴：データ削除
$(function(){
	$(document).on("click","#destroy_data",function() {
		var tableid = document.getElementById('rireki_table');
		var dd_address_rows = dd_address.index(this.rowIndex) + 1;
		var delete_date = tableid.rows[dd_address_rows].cells[0].innerText;
		var delete_order_wh = tableid.rows[dd_address_rows].cells[1].innerText;
		var delete_in_wh = tableid.rows[dd_address_rows].cells[2].innerText;
		var delete_out_wh = tableid.rows[dd_address_rows].cells[3].innerText;
		var delete_company = tableid.rows[dd_address_rows].cells[4].innerText;
		var delete_words = "WHERE date = '" + delete_date + "' AND order_wh = " + delete_order_wh + " AND in_wh = " + delete_in_wh + " AND out_wh = " + delete_out_wh + " AND memo = '" + delete_company + "'";
		var delete_row = alasql('DELETE FROM trans ' + delete_words)[0];
		dd_address = "";
		window.location.assign('stock.html?id=' + id);
	});
});

