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
		tr.append('<td class="table_date">' + row.trans.date + '</td>');
		tr.append('<td class="table_shop">' + row.trans.shop + '</td>');
		tr.append('<td class="table_num">' + numberWithCommas(row.trans.num) + '</td>');	
		tr.append('<td class="table_deadline">' + row.trans.deadline + '</td>');
		if (state_check == 4){
			tr.append('<td class="table_state">' + '<button class="btn btn-danger btn-xs" id="fix_data_address" name="' + row.trans.id + '">受注済み</button>' + '</td>');
		}
		else if (state_check == 5){
			tr.append('<td class="table_state">' + '<button class="btn btn-warning btn-xs" id="fix_data_address" name="' + row.trans.id + '">納期確定済み</button>' + '</td>');
		}
		else if (state_check == 6){
			tr.append('<td class="table_state">' + '<button class="btn btn-success btn-xs" id="fix_data_address" name="' + row.trans.id + '">出庫済み</button>' + '</td>');
		}
	tr.append('<td class="table_btn"><button type="button" class="btn btn-xs" id="delete_data_address" name="' + row.trans.id + '" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
	}
}

//パンくずリスト商品名追加
var bread_rows = alasql('SELECT * FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE stock.id = ?', [ id ])[0];
var this_bread_name = "(倉庫) " + bread_rows.whouse.name + "　(品番) " + bread_rows.item.maker + " : " + bread_rows.item.detail;
$('#this_bread').text(this_bread_name);

// 受注データ0件の処理
var table_length = shukko_process_table.rows.length;
if (table_length == 1){
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td class="table_date">受注データなし</td>');
	tr.append('<td class="table_shop">-</td>');
	tr.append('<td class="table_num">-</td>');
	tr.append('<td class="table_deadline">-</td>');
	tr.append('<td class="table_state">-</td>');	
	tr.append('<td class="table_btn"></td>');
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
	var length_check = date.length; //長さ16桁
	var year_check = date.slice(0,4); //年
	var bar1_check = date.charAt(4); //ハイフン
	var month_check = date.slice(5,7); //月
	var bar2_check = date.charAt(7); //ハイフン
	var date_check = date.slice(8,10); //日
	var space_check = date.charAt(10); //スペース
	var hour10_check = date.charAt(11); //時間10の位
	var hour01_check = date.charAt(12); //時間1の位
	var hour_check = 0;
		if (hour10_check == 0 || hour10_check == 1){
			if (hour01_check >=0 && hour01_check <=9){hour_check = 1} //00～19時
			else{hour_check = 0}
		}
		else if (hour10_check == 2){
			if (hour01_check >=0 && hour01_check <=3){hour_check = 1}//20～23時	
			else{hour_check = 0}
		}
		else{
			hour_check = 0;
		}
	var colon_check = date.charAt(13); //コロン
	var minute_check = 0;
	var minute10_check = date.charAt(14); //分10の位
	var minute01_check = date.charAt(15); //分1の位
		if (minute10_check >= 0 && minute10_check <= 5){ //0～5
			if (minute01_check >=0 && minute01_check <=9){minute_check = 1} //0～9
			else{minute_check = 0}
		}
		else{
			minute_check = 0;
		}
	var millisec_check = Date.parse(date); //ミリ秒
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
	
	//日時が正しいことをチェック
	var date_ok = 0;
	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && space_check ==" " && hour_check == 1 && colon_check ==":" && minute_check == 1 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
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
	var shop_num = shop.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
	var shop_length = shop.length - shop_num;
	if (shop_length == 0 || shop_length > 10){ //0文字 or 11文字以上の場合アウト
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
		var length_check2 = deadline.length; //長さ16桁
		var year_check2 = deadline.slice(0,4); //年
		var bar1_check2 = deadline.charAt(4); //ハイフン
		var month_check2 = deadline.slice(5,7); //月
		var bar2_check2 = deadline.charAt(7); //ハイフン
		var date_check2 = deadline.slice(8,10); //日
		var space_check2 = date.charAt(10); //スペース
		var hour10_check2 = date.charAt(11); //時間10の位
		var hour01_check2 = date.charAt(12); //時間1の位
		var hour_check2 = 0;
			if (hour10_check2 == 0 || hour10_check2 == 1){
				if (hour01_check2 >=0 && hour01_check2 <=9){hour_check2 = 1} //00～19時
				else{hour_check2 = 0}
			}
			else if (hour10_check2 == 2){
				if (hour01_check2 >=0 && hour01_check2 <=3){hour_check2 = 1}//20～23時	
				else{hour_check2 = 0}
			}
			else{
				hour_check2 = 0;
			}
		var colon_check2 = date.charAt(13); //コロン
		var minute_check2 = 0;
		var minute10_check2 = date.charAt(14); //分10の位
		var minute01_check2 = date.charAt(15); //分1の位
			if (minute10_check2 >= 0 && minute10_check2 <= 5){ //0～5
				if (minute01_check2 >=0 && minute01_check2 <=9){minute_check2 = 1} //0～9
				else{minute_check2 = 0}
			}
			else{
				minute_check2 = 0;
			}
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
		if (length_check2 == 16 && year_check2 >= 2010 && year_check2 <= y+1 && bar1_check2 == "-" && month_check2 >= 1 && month_check2 <=12 && bar2_check2 == "-" && date_check2 >=1 && date_check2 <=31 && space_check2 ==" " && hour_check2 == 1 && colon_check2 ==":" && minute_check2 == 1 && millisec_check2 != "NaN" && lastdate_check2 >= date_check2 && month_check2 == lastmonth_check2){
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

//チェックボックスクリック(出庫済み)
$(function(){
	$(document).on("click","#checkbox_set1_state6",function() {
	var abc = $("#checkbox_set1_state6:checked");
	console.log(abc);
		
		
	$('#checkbox_set1_state6').replaceWith('<label class="btn btn-default btn-xs active" id="checkbox_set1_state6"><input type="checkbox" autocomplete="off" checked> 出庫済み</label>');
	
	
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-success active" id="btn_state6"><input type="radio" autocomplete="off" checked> 出庫済み</label>').appendTo("#selected_state");
	});
});

//履歴データ編集 
$(function(){
	$(document).on("click","#fix_data_address",function() {
		var fix_row_id = $(this).attr("name");
		window.location.assign('stock-out-fix.html?id=' + fix_row_id);
	});
});

//履歴データ削除
var delete_row_id=""; 
$(function(){ //削除箇所を先に指定 (モーダルダイアログでthisが使えない)
	$(document).on("click","#delete_data_address",function() {
		delete_row_id = $(this).attr("name");
	});
});
$(function(){ //SQL内のデータを削除し、結果的にテーブルから削除
	$(document).on("click","#destroy_data",function() {
		alasql('DELETE FROM trans WHERE id = ' + delete_row_id)[0]; //idを用いてデータを削除する
		delete_row_id = "";
		window.location.assign('stock-out.html?id=' + id);
	});
});

//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});
