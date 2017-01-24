// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 受注・出庫データ読み込み
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-shukko_process_table');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var purpose_check = row.trans.purpose;
	var state_check = row.trans.state;
	if (purpose_check == 2){
		var tr = $('<tr>').appendTo(tbody);
		tr.append('<td>' + row.trans.date + '</td>');
		tr.append('<td>' + row.trans.shop + '</td>');
		tr.append('<td>' + numberWithCommas(row.trans.num) + '</td>');	
		tr.append('<td>' + row.trans.deadline + '</td>');
		if (state_check == 4){
			tr.append('<td>' + '<span class="label label-danger" style="font-size:86%;">受注済み</span>' + '</td>');
		}
		else if (state_check == 5){
			tr.append('<td>' + '<span class="label label-warning" style="font-size:86%;">納期回答済み</span>' + '</td>');
		}
		else if (state_check == 6){
			tr.append('<td>' + '<span class="label label-success" style="font-size:86%;">出庫済み</span>' + '</td>');
		}
	tr.append('<td class="text-right"><button type="button" class="btn btn-xs" id="delete_data_address" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
	}
}

// 受注データ0件の処理
var table_length = syukko_process_table.rows.length;
if (table_length == 1){
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>受注データ未登録</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
}

// 取引先入力補助
var shop_rows = alasql('SELECT DISTINCT shop FROM trans');
for (var i = 0; i < shop_rows.length; i++) {
	var shop_row = shop_rows[i];
	$('<option value = "' + shop_row.shop + '">').appendTo('#shops');
}


//受注データ登録ボタン
$('#update_order').on('click', function() {
	//受注日日付チェック準備
	var date = $('input[name="date1"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	if (month_check == 1 || month_check == 3 || month_check == 5 || month_check == 7 || month_check == 8 || month_check == 10 || month_check == 12){
		var lastdate_check = 31; //1 3 5 7 8 10 12月の最終日は31日
		var lastmonth_check = month_check;
	}
	else { //2 4 6 9 11月の最終日割り出し
		var lastdate = new Date(date);
			lastdate.setMonth(lastdate.getMonth() + 1);
			lastdate.setDate(0);
		var lastdate_check = lastdate.getDate();
		var lastmonth_check = lastdate.getMonth() + 1;
	}
	
	//日付が正しいことをチェック
	var date_ok = 0;
	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
		$("#order-form_date_span").css("color","black");
		$("#selected_date1").css("color","black");
		date_ok = 1;
	}
	else{
		$("#selected_date1").css("color","red");
		$("#order-form_date_span").css("color","red");
		$("#order-form_date_span").animate({opacity: 0.4},50);
		$("#order-form_date_span").animate({opacity: 1.0},50);
		$("#order-form_date_span").animate({opacity: 0.4},50);
		$("#order-form_date_span").animate({opacity: 1.0},50);
		date_ok = 0;
	}
	
	//取引先が入力されていることをチェック
	var shop_ok = 0;
	var shop = $('input[name="shop1"]').val();
	if (shop == ""){
		$("#selected_shop1").css("color","red");
		$("#order-form_shop_span").css("color","red");
		$("#order-form_shop_span").animate({opacity: 0.4},50);
		$("#order-form_shop_span").animate({opacity: 1.0},50);
		$("#order-form_shop_span").animate({opacity: 0.4},50);
		$("#order-form_shop_span").animate({opacity: 1.0},50);
		shop_ok = 0;
	}
	else{
		$("#selected_shop1").css("color","black");
		$("#order-form_shop_span").css("color","black");
		shop_ok = 1;
	}
	
	//数値が1～999,999の整数であることをチェック
	var num_ok = 0;
	var num = parseInt($('input[name="number1"]').val());
	var num2 = $('input[name="number1"]').val();
	var num_check = num - num2; //整数ならばゼロ
	if (num_check === 0 && num > 0 && num < 1000000){
		$("#selected_number1").css("color","black");
		$("#order-form_number_span").css("color","black");
		num_ok = 1;
	}
	else {
		$("#selected_number1").css("color","red");
		$("#order-form_number_span").css("color","red");
		$("#order-form_number_span").animate({opacity: 0.4},50);
		$("#order-form_number_span").animate({opacity: 1.0},50);
		$("#order-form_number_span").animate({opacity: 0.4},50);
		$("#order-form_number_span").animate({opacity: 1.0},50);
		num_ok = 0;
	}
	
	//納期チェック (チェックボックスの状態)
	var deadline_ok = 0;
	var deadline_checkbox = document.getElementById("deadline_checkbox");
	if (deadline_checkbox.checked){
		$("#order-form_deadline_span").css("color","black");
		$("#selected_deadline1").css("color","black");
		var deadline = "0000-00-00 00:00"
		deadline_ok = 2;
	}
	else{
		//納期日付チェック準備
		var deadline = $('input[name="deadline1"]').val();
		var length_check2 = deadline.length;
		var year_check2 = deadline.slice(0,4);
		var bar1_check2 = deadline.charAt(4);
		var month_check2 = deadline.slice(5,7);
		var bar2_check2 = deadline.charAt(7);
		var date_check2 = deadline.slice(8,10);
		var millisec_check2 = Date.parse(deadline);
		if (month_check2 == 1 || month_check2 == 3 || month_check2 == 5 || month_check2 == 7 || month_check2 == 8 || month_check2 == 10 || month_check2 == 12){
			var lastdate_check2 = 31; //1 3 5 7 8 10 12月の最終日は31日
			var lastmonth_check2 = month_check2;
		}
		else { //2 4 6 9 11月の最終日割り出し
			var lastdate2 = new Date(deadline);
				lastdate2.setMonth(lastdate2.getMonth() + 1);
				lastdate2.setDate(0);
			var lastdate_check2 = lastdate2.getDate();
			var lastmonth_check2 = lastdate2.getMonth() + 1;
		}
		
		//納期日付が正しいことをチェック
		if (length_check2 == 16 && year_check2 >= 2010 && year_check2 <= y+1 && bar1_check2 == "-" && month_check2 >= 1 && month_check2 <=12 && bar2_check2 == "-" && date_check2 >=1 && date_check2 <=31 && millisec_check2 != "NaN" && lastdate_check2 >= date_check2 && month_check2 == lastmonth_check2){
			$("#order-form_deadline_span").css("color","black");
			$("#selected_deadline1").css("color","black");
			deadline_ok = 1;
		}
		else{
			$("#order-form_deadline_span").css("color","red");
			$("#selected_deadline1").css("color","red");
			$("#order-form_deadline_span").animate({opacity: 0.4},50);
			$("#order-form_deadline_span").animate({opacity: 1.0},50);
			$("#order-form_deadline_span").animate({opacity: 0.4},50);
			$("#order-form_deadline_span").animate({opacity: 1.0},50);
			deadline_ok = 0;
		}
	}
	
	//全条件クリアしていることをチェック (納期未確定)
	if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 2){
	var purpose = 2;
	var state = 4
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?)', [ trans_id, id, purpose, state, date, deadline, num, shop]);
	window.location.assign('stock-out.html?id=' + id);
	}
	
	//全条件クリアしていることをチェック (納期確定済み)
	if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 1){
	var purpose = 2;
	var state = 5
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?)', [ trans_id, id, purpose, state, date, deadline, num, shop]);
	window.location.assign('stock-out.html?id=' + id);
	}
});

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
	var selected_date = y + '-' + m + '-' + d + ' ' + h + ':' + min;
	$("#selected_date1").attr("value", selected_date);
	var selected_deadline = y + '-' + m + '-' + d + ' 00:00';
	$("#selected_deadline1").attr("value", selected_deadline);
});


//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});
