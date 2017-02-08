// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 受注・出庫データ読み込み (2-8のみ)
var rows = alasql('SELECT * FROM trans WHERE stock = ' + id + ' AND purpose = 2 AND state = 8');
var tbody = $('#tbody-shukko_process_table');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var purpose_check = row.trans.purpose;
	var tr = $('<tr class="table_statecheck_6">').appendTo(tbody);
		tr.append('<td class="table_date">' + row.trans.date + '</td>');
		tr.append('<td class="table_shop">' + row.trans.shop + '</td>');
		tr.append('<td class="table_num">' + numberWithCommas(row.trans.num) + '</td>');	
		tr.append('<td class="table_deadline">' + row.trans.deadline + '</td>');
		tr.append('<td class="table_state">' + '<button class="btn btn-primary btn-xs" id="fix_data_address" name="' + row.trans.id + '">棚卸</button>' + '</td>');
		tr.append('<td class="table_btn"><button type="button" class="btn btn-xs" id="delete_data_address" name="' + row.trans.id + '" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
}
//受注・出庫データ読み込み (1-9のみ)
var rows = alasql('SELECT * FROM trans WHERE stock = ' + id + ' AND purpose = 1 AND state = 9');
var tbody = $('#tbody-shukko_process_table');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var purpose_check = row.trans.purpose;
	var tr = $('<tr class="table_statecheck_6">').appendTo(tbody);
		tr.append('<td class="table_date">' + row.trans.date + '</td>');
		tr.append('<td class="table_shop">' + row.trans.shop + '</td>');
		tr.append('<td class="table_num">' + numberWithCommas(row.trans.num) + '</td>');	
		tr.append('<td class="table_deadline">' + row.trans.deadline + '</td>');
		tr.append('<td class="table_state">' + '<button class="btn btn-primary btn-xs" id="fix_data_address" name="' + row.trans.id + '">棚卸</button>' + '</td>');
		tr.append('<td class="table_btn"><button type="button" class="btn btn-xs" id="delete_data_address" name="' + row.trans.id + '" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
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
	tr.append('<td class="table_date">棚卸データなし</td>');
	tr.append('<td class="table_shop">-</td>');
	tr.append('<td class="table_num">-</td>');
	tr.append('<td class="table_deadline">-</td>');
	tr.append('<td class="table_state">-</td>');	
	tr.append('<td class="table_btn"></td>');
}

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
});

//返品データ登録ボタン
$('#update_order').on('click', function() {
	//受注日日付チェック準備
	var date = $('input[name="date1"]').val();

	//長さ16桁チェック
	var length_check_sub = date.length;
	var length_check = 0;
		if (length_check_sub == 16){length_check = 1}

	//年(2010-2018)
	var year_check_sub = parseInt(date.slice(0,4));
	var year_check = 0;
		if (year_check_sub >= 2010 && year_check_sub <= y+1){year_check = 1}

	//ハイフン
	var bar1_check_sub = date.charAt(4);
	var bar1_check = 0;
		if (bar1_check_sub == "-"){bar1_check = 1}

	//月(1-12)
	var month_check_sub = parseInt(date.slice(5,7));
	var month10_check = parseInt(date.charAt(5)); //月10の位
	var month01_check = parseInt(date.charAt(6)); //月1の位
	var month_check = 0;
		if (month_check_sub >= 1 && month_check_sub <= 12){
			if (month10_check == 0){
				if (month01_check >= 1 && month01_check <= 9){month_check = 1} //01-09月
			}
			else if (month10_check == 1){
				if (month01_check >= 0 && month01_check <= 2){month_check = 1} //10-12月
			}
		}

	//ハイフン
	var bar2_check_sub = String(date.charAt(7));
	var bar2_check = 0;
		if (bar2_check_sub == "-"){bar2_check = 1}

	//日(1-31)
	var date_check_sub = parseInt(date.slice(8,10));
	var date10_check = parseInt(date.charAt(8)); //月10の位
	var date01_check = parseInt(date.charAt(9)); //月1の位
	var date_check = 0;
		if (date_check_sub >= 1 && date_check_sub <= 31){
			if (date10_check == 0){
				if (date01_check >= 1 && date01_check <= 9){date_check = 1} //01-09日
			}
			else if (date10_check == 1 || date10_check == 2){
				if (date01_check >= 0 && date01_check <= 9){date_check = 1} //10-29日
			}			
			else if (date10_check == 3){
				if (date01_check == 0 || date01_check == 1){date_check = 1} //30,31日
			}
		}
		
	//スペース
	var space_check_sub = date.charAt(10);
	var space_check = 0;
	if (space_check_sub == " "){space_check = 1}
	
	//時間(00-23)
	var hour_check_sub = parseInt(date.slice(11,13));
	var hour10_check = parseInt(date.charAt(11)); //時間10の位
	var hour01_check = parseInt(date.charAt(12)); //時間1の位
	var hour_check = 0;
		if (hour_check_sub >= 0 && hour_check_sub <= 23){
			if (hour10_check == 0 || hour10_check == 1){
				if (hour01_check >=0 && hour01_check <=9){hour_check = 1} //00～19時
			}
			else if (hour10_check == 2){
				if (hour01_check >=0 && hour01_check <=3){hour_check = 1}//20～23時
			}
		}

	//コロン
	var colon_check_sub = date.charAt(13);
	var colon_check = 0;
		if (colon_check_sub == ":"){colon_check = 1}	
	
	//分(00-59)
	var minute_check_sub = parseInt(date.slice(14,16));
	var minute10_check = parseInt(date.charAt(14)); //分10の位
	var minute01_check = parseInt(date.charAt(15)); //分1の位
	var minute_check = 0;
		if (minute10_check >= 0 && minute10_check <= 5){ //0～5
			if (minute01_check >=0 && minute01_check <=9){minute_check = 1} //0～9
		}

	//ミリ秒
	var millisec_check_sub = Date.parse(date);
	var millisec_check = 0;
		if (millisec_check_sub != "NaN"){millisec_check = 1}
	
	//各月の最終日を越えてないかチェック
	if (month_check_sub == 1 || month_check_sub == 3 || month_check_sub == 5 || month_check_sub == 7 || month_check_sub == 8 || month_check_sub == 10 || month_check_sub == 12){
		var lastday = 31; //1 3 5 7 8 10 12月の最終日は31日
		var lastday_month = month_check_sub;
	}
	else { //2 4 6 9 11月の最終日割り出し
		var lastday_sub = new Date(date);
			lastday_sub.setMonth(lastday_sub.getMonth() + 1);
			lastday_sub.setDate(0);
		var lastday = lastday_sub.getDate(); //最終日
		var lastday_month = lastday_sub.getMonth() + 1;
	}
	var lastday_check = 0;
		if (lastday >= date_check_sub && lastday_month == month_check_sub){lastday_check = 1}	
	
	//日時が正しいことをチェック
	var date_ok = 0;
	if (length_check == 1 && year_check == 1 && bar1_check == 1 && month_check == 1 && bar2_check == 1 && date_check ==1 && space_check == 1 && hour_check == 1 && colon_check == 1 && minute_check == 1 && millisec_check == 1 && lastday_check == 1){
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
	
	//数値が-999,999～999,999の整数であることをチェック
	var num_ok = 0;
	var num = parseInt($('input[name="number1"]').val());
	var num2 = $('input[name="number1"]').val();
	var num_check = num - num2; //整数ならばゼロ
	if (num_check === 0 && num > -1000000 && num < 1000000 && num != 0){
		$("#selected_number1").css("color","black");
		$("#order-form_number_span").css("color","black");
		var shop_in_total_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + id + "AND purpose = 1 AND state = 3")[0];
		var shop_in_total = shop_in_total_sql["SUM(num)"]; //入庫数合計
		var shop_out_total_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + id + "AND purpose = 2 AND state = 6")[0];
		var shop_out_total = shop_out_total_sql["SUM(num)"]; //出庫数合計
		var shop_return_total_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + id + "AND purpose = 2 AND state = 7")[0];
		var shop_return_total = shop_return_total_sql["SUM(num)"]; //返品数合計
		var shop_inventory_total_p_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + id + "AND purpose = 2 AND state = 8")[0];
		var shop_inventory_total_p = shop_inventory_total_p_sql["SUM(num)"]; //棚卸不足数合計
		var shop_inventory_total_m_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + id + "AND purpose = 1 AND state = 9")[0];
		var shop_inventory_total_m = shop_inventory_total_m_sql["SUM(num)"]; //棚卸過剰数合計(中身はマイナス)
		//入庫 - 棚卸(過剰：マイナス) - 出庫 + 返品 - 棚卸(不足：プラス) - 入力値(num) が現時点の在庫数
		var stock_num = shop_in_total - shop_inventory_total_m - shop_out_total + shop_return_total - shop_inventory_total_p - num;
		if (stock_num < 0 ){ //現時点の在庫数が0未満の場合は登録不可
			$("#selected_number1").css("color","red");
			$("#order-form_number_span").css("color","red");
			$("#order-form_number_span").animate({opacity: 0.4},50);
			$("#order-form_number_span").animate({opacity: 1.0},50);
			$("#order-form_number_span").animate({opacity: 0.4},50);
			$("#order-form_number_span").animate({opacity: 1.0},50);
			$("#too_much").empty();
			var too_much_text = '(データ更新によりこの商品の倉庫在庫数が ' + stock_num + ' となります。先に入庫・返品・棚卸調整データを修正してください。)';
			$("#too_much").append(too_much_text);
			num_ok = 0;
		}
		else { //条件クリア
			$("#selected_number1").css("color","black");
			$("#order-form_number_span").css("color","black");
			$("#too_much").empty();
			num_ok = 1;
		}
	}
	else { //-1m～1m以外
		$("#selected_number1").css("color","red");
		$("#order-form_number_span").css("color","red");
		$("#order-form_number_span").animate({opacity: 0.4},50);
		$("#order-form_number_span").animate({opacity: 1.0},50);
		$("#order-form_number_span").animate({opacity: 0.4},50);
		$("#order-form_number_span").animate({opacity: 1.0},50);
		$("#too_much").empty();
		num_ok = 0;
	}

	//全条件クリアしていることをチェック
	if (date_ok == 1 && num_ok == 1){
		if(num > 0){
			var purpose = 2;
			var state = 8;
		}
		else{
			var purpose = 1;
			var state = 9;
		}
	var shop = "棚卸"
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?)', [ trans_id, id, purpose, state, date, date, num, shop]);
	window.location.assign('stock-inventory.html?id=' + id);
	}
});

//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

//履歴データ編集 
$(function(){
	$(document).on("click","#fix_data_address",function() {
		var fix_row_id = $(this).attr("name");
		window.location.assign('stock-inventory-fix.html?id=' + fix_row_id);
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
		window.location.assign('stock-inventory.html?id=' + id);
	});
});

//タブhover
$(function(){
	$("ul.dropdown-menu").hide();
	$("li.dropdown").hover(function(){
		$("ul:not(:animated)",this).slideDown("fast");
	},
	function(){
		$("ul",this).slideUp("fast");
	});
});