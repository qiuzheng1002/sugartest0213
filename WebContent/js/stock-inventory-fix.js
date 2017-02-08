// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//パンくずリスト：商品名(取引先名)
var bread_rows = alasql('SELECT * FROM trans \
		JOIN stock ON stock.id = trans.stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE trans.id = ?', [ id ])[0];
$('#this_bread_detail').replaceWith("<li id='this_bread_detail'><a href='stock-inventory.html?id=" + bread_rows.trans.stock + "'>[倉庫] " + bread_rows.whouse.name + "　[品番] " + bread_rows.item.maker + " : " + bread_rows.item.detail + "</a></li>");
$('#this_bread_shop').append("棚卸データ編集 (" + bread_rows.trans.shop + ")");
var trans_stock_id = bread_rows.trans.stock; //transCSVのstock番号取得

//棚卸データ読み込み
var rows = alasql('SELECT * FROM trans WHERE id = ?', [ id ])[0];
$("#selected_date1").attr("value", rows.trans.date);
$("#selected_num1").attr("value", rows.trans.num);
var this_data = rows.trans.num; //変更前データ

//本日の日付を取得
var y = 0;
var date_today = "";
$(function(){
	var time = $.now();
	var dateObj = new Date(time);
		y = dateObj.getFullYear();
	var m = dateObj.getMonth() + 1;
		if(m<10){m = "0" + m}
	var d = dateObj.getDate();
		if(d<10){d = "0" + d}
	date_today = y + '-' + m + '-' + d + ' 00:00';
})

//データ更新ボタン
$('#update_data').on('click', function() {
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
		var shop_in_total_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + trans_stock_id + "AND purpose = 1 AND state = 3")[0];
		var shop_in_total = shop_in_total_sql["SUM(num)"]; //入庫数合計
		var shop_out_total_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + trans_stock_id + "AND purpose = 2 AND state = 6")[0];
		var shop_out_total = shop_out_total_sql["SUM(num)"]; //出庫数合計
		var shop_return_total_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + trans_stock_id + "AND purpose = 2 AND state = 7")[0];
		var shop_return_total = shop_return_total_sql["SUM(num)"]; //返品数合計
		var shop_inventory_total_p_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + trans_stock_id + "AND purpose = 2 AND state = 8")[0];
		var shop_inventory_total_p = shop_inventory_total_p_sql["SUM(num)"]; //棚卸不足数合計
		var shop_inventory_total_m_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + trans_stock_id + "AND purpose = 1 AND state = 9")[0];
		var shop_inventory_total_m = shop_inventory_total_m_sql["SUM(num)"]; //棚卸過剰数合計(中身はマイナス)
		//入庫 - 棚卸(過剰：マイナス) - 出庫 + 返品 - 棚卸(不足：プラス) + 変更前データ - 変更後データ(入力値(num)) が現時点の在庫数
		var stock_num = shop_in_total - shop_inventory_total_m - shop_out_total + shop_return_total - shop_inventory_total_p + this_data - num;
		if (stock_num < 0 ){ //現時点の在庫数が0未満の場合は登録不可
			$("#selected_num1").css("color","red");
			$("#order-form_number_span").css("color","red");
			$("#order-form_number_span").animate({opacity: 0.4},50);
			$("#order-form_number_span").animate({opacity: 1.0},50);
			$("#order-form_number_span").animate({opacity: 0.4},50);
			$("#order-form_number_span").animate({opacity: 1.0},50);
			$("#too_much").empty();
			var too_much_text = '(データ更新によりこの商品の倉庫在庫数が ' + stock_num + ' となります。先に入庫・出庫・返品データを修正してください。)';
			$("#too_much").append(too_much_text);
			num_ok = 0;
		}
		else { //条件クリア
			$("#selected_num1").css("color","black");
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

	//全条件クリアでデータ更新
	if (date_ok == 1 && num_ok == 1){
		if(num > 0){ //不足データ追加
			alasql("UPDATE trans SET purpose = 2, state = 8, date = '" + date + "', deadline = '" + date + "', num = " + num + ", shop = '棚卸' WHERE id = " + id);	
		}
		else { //過剰データ追加
			alasql("UPDATE trans SET purpose = 1, state = 9, date = '" + date + "', deadline = '" + date + "', num = " + num + ", shop = '棚卸' WHERE id = " + id);
		}
	window.location.assign("stock-inventory.html?id=" + bread_rows.trans.stock);
	}
});

// ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});