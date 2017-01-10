// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

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
$('#price').text(numberWithCommas(row.item.price));
var balance = row.stock.balance; // 入出庫で利用
$('#balance').text(balance);
$('#leadtime').text(row.item.leadtime + '日');

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


// 受注処理
$('#update_order').on('click', function() {
	var date = $('input[name="date1"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	var lastdate = "";
		lastdate.setMonth(date.getMonth() + 1);
		console.log(lastdate);
		lastdate.setDate(0);
		console.log(lastdate);
	var lastdate_check = lastdate.slice(5,7);
	console.log(length_check);
	console.log(year_check);
	console.log(bar1_check);
	console.log(month_check);
	console.log(bar2_check);
	console.log(date_check);
	console.log(millisec_check);
	console.log(lastdate_check);
	
	if (length_check == 16 && year_check >= 2000 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN"){
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

//入庫処理
$('#update_in').on('click', function() {
	var date = $('input[name="date2"]').val();
	var order_wh = 0;
	var in_wh = parseInt($('input[name="in_wh"]').val());
	var out_wh = 0;
	var memo = $('input[name="memo2"]').val();
	alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + order_wh, id ]);
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
	window.location.assign('stock.html?id=' + id);
});

//出庫処理
$('#update_out').on('click', function() {
	var date = $('input[name="date3"]').val();
	var order_wh = 0;
	var in_wh = 0;
	var out_wh = parseInt($('input[name="out_wh"]').val());
	var memo = $('input[name="memo3"]').val();
	alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + order_wh, id ]);
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
	window.location.assign('stock.html?id=' + id);
});

//本日の日付を自動入力
var y = 0;
setInterval(function(){
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
		console.log(delete_date);
		console.log(delete_order_wh);
		console.log(delete_in_wh);
		console.log(delete_out_wh);
		console.log(delete_company);
		alasql('DELETE FROM trans WHERE date = "' + delete_date + '" AND order_wh = ' + delete_order_wh + ' AND in_wh = ' + delete_in_wh + ' AND out_wh = "' + delete_out_wh + '"');
/*		$(dd_address).remove(); */
		dd_address = "";
		window.location.assign('stock.html?id=' + id);
	});
});

