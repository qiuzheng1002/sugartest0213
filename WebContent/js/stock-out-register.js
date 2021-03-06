// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//パンくずリスト：商品名(取引先名)
var bread_rows = alasql('SELECT * FROM trans \
		JOIN stock ON stock.id = trans.stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE trans.id = ?', [ id ])[0];

var url = document.referrer; //直前のページ調査
var url_last18 = url.substr(url.length - 18);
if (url_last18 == "index-out-all.html"){
	var last_url = "index-out-all.html"
	$('#this_bread_tab').append('<a href="index-out-all.html">受注・出庫&nbsp;&ndash;&nbsp;[受注案件別]&nbsp;進捗管理</a>');
	$('#this_bread_detail').replaceWith('<li id="this_bread_detail" class="hidden"></li>');
	$('#this_bread_shop').append("受注データ編集 ( [倉庫] " + bread_rows.whouse.name + "　[品番] " + bread_rows.item.maker + " : " + bread_rows.item.detail+ " )");
}
else{
	var last_url = "stock-out.html?id=" + bread_rows.trans.stock;
	$('#this_bread_tab').append('<a href="index-out.html">受注・出庫&nbsp;&ndash;&nbsp;[商品別]&nbsp;進捗管理・データ登録</a>');
	$('#this_bread_detail').replaceWith("<li id='this_bread_detail'><a href='stock-out.html?id=" + bread_rows.trans.stock + "'>[倉庫] " + bread_rows.whouse.name + "　[品番] " + bread_rows.item.maker + " : " + bread_rows.item.detail + "</a></li>");
	$('#this_bread_shop').append("受注データ編集 (" + bread_rows.trans.shop + ")");
}

//入力禁止フォーム用
var input_field = document.getElementById("selected_deadline1"); //納期入力欄

// 受注・出庫データ読み込み
var rows = alasql('SELECT * FROM trans WHERE id = ?', [ id ])[0];
$("#selected_date1").attr("value", rows.trans.date);
$("#selected_shop1").attr("value", rows.trans.shop);
$("#selected_num1").attr("value", rows.trans.num);
$("#selected_deadline1").attr("value", rows.trans.deadline);
var state_check = rows.trans.state;
if (state_check == 4){
	$('<label class="btn btn-danger active" id="btn_state4"><input type="radio" name="radio_state_check4" autocomplete="off" checked> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" name="radio_state_check5" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" name="radio_state_check6" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
	$('input[name="deadline_checkbox_name"]').prop("checked", true);
	input_field.disabled = true;
}
else if (state_check == 5){
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" name="radio_state_check4" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-warning active" id="btn_state5"><input type="radio" name="radio_state_check5" autocomplete="off" checked> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" name="radio_state_check6" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
}
else if (state_check == 6){
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" name="radio_state_check4" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" name="radio_state_check5" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-success active" id="btn_state6"><input type="radio" name="radio_state_check6" autocomplete="off" checked> 出庫済み</label>').appendTo("#selected_state");
}

//入庫数読み込み
var in_13_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 3', [ bread_rows.trans.stock ])[0];
var in_13 = in_13_sql["SUM(num)"]; //入庫済み
var in_19_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 9', [ bread_rows.trans.stock ])[0];
var in_19 = in_19_sql["SUM(num)"]; //棚卸(過剰)数：値はマイナスで保持

//出庫数読み込み
var out_26_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 6', [ bread_rows.trans.stock ])[0];
var out_26 = out_26_sql["SUM(num)"]; //出庫済み
var out_27_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 7', [ bread_rows.trans.stock ])[0];
var out_27 = out_27_sql["SUM(num)"]; //返品数
var out_28_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 8', [ bread_rows.trans.stock ])[0];
var out_28 = out_28_sql["SUM(num)"]; //棚卸(不足)数

//在庫数吐き出し
var warehouse_stock = in_13 - in_19 - out_26 + out_27 - out_28; //在庫数(倉庫内在庫)

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


//ラジオボタンクリック(受注済み)
$(function(){
	$(document).on("click","#btn_state4",function() {
	$('#selected_state').empty();
	$('<label class="btn btn-danger active" id="btn_state4"><input type="radio" name="radio_state_check4" autocomplete="off" checked> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" name="radio_state_check5" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" name="radio_state_check6" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
	$('input[name="deadline_checkbox_name"]').prop("checked", true);
	input_field.disabled = true;
	});
});

//ラジオボタンクリック(納期確定済み)
$(function(){
	$(document).on("click","#btn_state5",function() {
	$('#selected_state').empty();
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" name="radio_state_check4" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-warning active" id="btn_state5"><input type="radio" name="radio_state_check5" autocomplete="off" checked> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state6"><input type="radio" name="radio_state_check6" autocomplete="off"> 出庫済み</label>').appendTo("#selected_state");
	if ($('#selected_deadline1').attr("value") == "0000-00-00 00:00") { //納期がゼロの場合のみ本日の日付を入力
		$("#selected_deadline1").attr("value", date_today);
	}
	$('input[name="deadline_checkbox_name"]').prop("checked", false);
	input_field.disabled = false;
	});
});

//ラジオボタンクリック(出庫済み)
$(function(){
	$(document).on("click","#btn_state6",function() {
	$('#selected_state').empty();
	$('<label class="btn btn-default" id="btn_state4"><input type="radio" name="radio_state_check4" autocomplete="off"> 受注済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-default" id="btn_state5"><input type="radio" name="radio_state_check5" autocomplete="off"> 納期確定済み</label>').appendTo("#selected_state");
	$('<label class="btn btn-success active" id="btn_state6"><input type="radio" name="radio_state_check6" autocomplete="off" checked> 出庫済み</label>').appendTo("#selected_state");
	if ($('#selected_deadline1').attr("value") == "0000-00-00 00:00") { //納期がゼロの場合のみ本日の日付を入力
		$("#selected_deadline1").attr("value", date_today);
	}
	$('input[name="deadline_checkbox_name"]').prop("checked", false);
	input_field.disabled = false;
	});
});

//受注データ更新ボタン
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
		$("#selected_num1").css("color","black");
		$("#order-form_number_span").css("color","black");
		num_ok = 1;
	}
	else {
		$("#selected_num1").css("color","red");
		$("#order-form_number_span").css("color","red");
		$("#order-form_number_span").animate({opacity: 0.4},50);
		$("#order-form_number_span").animate({opacity: 1.0},50);
		$("#order-form_number_span").animate({opacity: 0.4},50);
		$("#order-form_number_span").animate({opacity: 1.0},50);
		num_ok = 0;
	}
	
	//ラジオボタンの状態チェック
	var radio_name = "";
	$(":radio:checked").each(function(){
		radio_name = $(this).attr("name");
	})
		
	if (radio_name == "radio_state_check4"){ //受注済みボタンチェックの場合
		//納期チェック (チェックボックスの状態)
		var deadline_ok = 0;
		var deadline_checkbox = $("#deadline_checkbox").prop("checked");
		if (deadline_checkbox == true){
			$("#order-form_deadline_span").css("color","black");
			$("#selected_deadline1").css("color","black");
			var deadline = "0000-00-00 00:00"
			deadline_ok = 4;
		}
	}
	else if (radio_name == "radio_state_check5" || radio_name == "radio_state_check6"){ //納期確定済み or 出荷済みボタンチェックの場合
		//納期日付チェック
		var deadline = $('input[name="deadline1"]').val();

		//長さ16桁チェック
		var length_check_sub2 = deadline.length;
		var length_check2 = 0;
			if (length_check_sub2 == 16){length_check2 = 1}

		//年(2010-2018)
		var year_check_sub2 = parseInt(deadline.slice(0,4));
		var year_check2 = 0;
			if (year_check_sub2 >= 2010 && year_check_sub2 <= y+1){year_check2 = 1}

		//ハイフン
		var bar1_check_sub2 = deadline.charAt(4);
		var bar1_check2 = 0;
			if (bar1_check_sub2 == "-"){bar1_check2 = 1}

		//月(1-12)
		var month_check_sub2 = parseInt(deadline.slice(5,7));
		var month10_check2 = parseInt(deadline.charAt(5)); //月10の位
		var month01_check2 = parseInt(deadline.charAt(6)); //月1の位
		var month_check2 = 0;
			if (month_check_sub2 >= 1 && month_check_sub2 <= 12){
				if (month10_check2 == 0){
					if (month01_check2 >= 1 && month01_check2 <= 9){month_check2 = 1} //01-09月
				}
				else if (month10_check2 == 1){
					if (month01_check2 >= 0 && month01_check2 <= 2){month_check2 = 1} //10-12月
				}
			}

		//ハイフン
		var bar2_check_sub2 = deadline.charAt(7);
		var bar2_check2 = 0;
			if (bar2_check_sub2 == "-"){bar2_check2 = 1}

		//日(1-31)
		var date_check_sub2 = parseInt(deadline.slice(8,10));
		var date10_check2 = parseInt(deadline.charAt(8)); //月10の位
		var date01_check2 = parseInt(deadline.charAt(9)); //月1の位
		var date_check2 = 0;
			if (date_check_sub2 >= 1 && date_check_sub2 <= 31){
				if (date10_check2 == 0){
					if (date01_check2 >= 1 && date01_check2 <= 9){date_check2 = 1} //01-09日
				}
				else if (date10_check2 == 1 || date10_check2 == 2){
					if (date01_check2 >= 0 && date01_check2 <= 9){date_check2 = 1} //10-29日
				}			
				else if (date10_check2 == 3){
					if (date01_check2 == 0 || date01_check2 == 1){date_check2 = 1} //30,31日
				}
			}
			
		//スペース
		var space_check_sub2 = deadline.charAt(10);
		var space_check2 = 0;
		if (space_check_sub2 == " "){space_check2 = 1}
		
		//時間(00-23)
		var hour_check_sub2 = parseInt(deadline.slice(11,13));
		var hour10_check2 = parseInt(deadline.charAt(11)); //時間10の位
		var hour01_check2 = parseInt(deadline.charAt(12)); //時間1の位
		var hour_check2 = 0;
			if (hour_check_sub2 >= 0 && hour_check_sub2 <= 23){
				if (hour10_check2 == 0 || hour10_check2 == 1){
					if (hour01_check2 >=0 && hour01_check2 <=9){hour_check2 = 1} //00～19時
				}
				else if (hour10_check2 == 2){
					if (hour01_check2 >=0 && hour01_check2 <=3){hour_check2 = 1}//20～23時
				}
			}

		//コロン
		var colon_check_sub2 = deadline.charAt(13);
		var colon_check2 = 0;
			if (colon_check_sub2 == ":"){colon_check2 = 1}	
		
		//分(00-59)
		var minute_check_sub2 = parseInt(deadline.slice(14,16));
		var minute10_check2 = parseInt(deadline.charAt(14)); //分10の位
		var minute01_check2 = parseInt(deadline.charAt(15)); //分1の位
		var minute_check2 = 0;
			if (minute10_check2 >= 0 && minute10_check2 <= 5){ //0～5
				if (minute01_check2 >=0 && minute01_check2 <=9){minute_check2 = 1} //0～9
			}

		//ミリ秒
		var millisec_check_sub2 = Date.parse(deadline);
		var millisec_check2 = 0;
			if (millisec_check_sub2 != "NaN"){millisec_check2 = 1}
		
		//各月の最終日を越えてないかチェック
		if (month_check_sub2 == 1 || month_check_sub2 == 3 || month_check_sub2 == 5 || month_check_sub2 == 7 || month_check_sub2 == 8 || month_check_sub2 == 10 || month_check_sub2 == 12){
			var lastday2 = 31; //1 3 5 7 8 10 12月の最終日は31日
			var lastday_month2 = month_check_sub2;
		}
		else { //2 4 6 9 11月の最終日割り出し
			var lastday_sub2 = new Date(deadline);
				lastday_sub2.setMonth(lastday_sub2.getMonth() + 1);
				lastday_sub2.setDate(0);
			var testdate = new Date(lastday_sub2)
			var lastday2 = lastday_sub2.getDate(); //最終日
			var lastday_month2 = lastday_sub2.getMonth() + 1;
		}
		var lastday_check2 = 0;
			if (lastday2 >= date_check_sub2 && lastday_month2 == month_check_sub2){lastday_check2 = 1}	

		//納期日時が正しいことをチェック
		var deadline_ok = 0;
		if (length_check2 == 1 && year_check2 == 1 && bar1_check2 == 1 && month_check2 == 1 && bar2_check2 == 1 && date_check2 ==1 && space_check2 == 1 && hour_check2 == 1 && colon_check2 == 1 && minute_check2 == 1 && millisec_check2 == 1 && lastday_check2 == 1){
			$("#order-form_deadline_span").css("color","black");
			$("#selected_deadline1").css("color","black");
			if (radio_name == "radio_state_check5"){
				deadline_ok = 5;
			}
			else if(radio_name == "radio_state_check6"){
				deadline_ok = 6;
			}
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
	
	//変更前と変更後のデータ準備
	var shop_out_this_data_sql = alasql('SELECT num FROM trans WHERE id = ?', [id])[0];
		//変更前データ数(変更前が出庫済みに限る：出庫済み以外から出庫済みに変更した場合、出庫数が純増のため)
		if(state_check == 6){
			var shop_out_this_data = shop_out_this_data_sql["num"]; 
		}
		else {
			shop_out_this_data = 0;
		}
	var input_data = num; //入力中のデータ
	var warehouse_stock_latest = warehouse_stock + shop_out_this_data - input_data;
	if (state_check == 6){  //変更前の状態が出庫済みか判別：登録数の減少により返品数が出庫数より多くなることを防ぐ
		if (input_data - shop_out_this_data < 0){ //入力数を減らしたときのチェック
			//1つのショップにおける 出庫数計 - 返品数 - 変更対象データ数 (+ 入力データ) がゼロ未満にならないようにする
			var this_shop_sql = alasql('SELECT shop FROM trans WHERE id = ?', [id])[0]; //shop名割り出し
			var this_shop = this_shop_sql["shop"];
			var this_stock_sql = alasql('SELECT stock FROM trans WHERE id = ?', [id])[0]; //stock番号割り出し
			var this_stock = this_stock_sql["stock"];
			var shop_out_26_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + this_stock + "AND purpose = 2 AND state = 6 AND shop = '" + this_shop + "'")[0];
			var shop_out_26 = shop_out_26_sql["SUM(num)"]; //出庫済み(shop)
			var shop_out_27_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + this_stock + "AND purpose = 2 AND state = 7 AND shop = '" + this_shop + "'")[0];
			var shop_out_27 = shop_out_27_sql["SUM(num)"]; //返品数(shop)
			var shop_out_total = shop_out_26 - shop_out_27 - shop_out_this_data + input_data; //1つのショップにおける 出庫数計 - 返品数 - 変更前データ数 + 変更後データ数
			if (shop_out_total < 0){  //ショップ内でマイナスにならないことをチェック
				$("#too_much").empty();
				var too_much_text = '(データ変更により ' + this_shop + ' への累計出庫数が ' + shop_out_total + ' となります。先に返品・棚卸調整データを修正してください。)';
				$("#too_much").append(too_much_text);
				$("#selected_shop1").css("color","red");
				$("#order-form_shop_span").css("color","red");
				$("#order-form_shop_span").animate({opacity: 0.4},50);
				$("#order-form_shop_span").animate({opacity: 1.0},50);
				$("#order-form_shop_span").animate({opacity: 0.4},50);
				$("#order-form_shop_span").animate({opacity: 1.0},50);
				return;
			}
			else{ //ショップ内で矛盾なし：全体数のチェック
				var all_out_26_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + this_stock + "AND purpose = 2 AND state = 6")[0];
				var all_out_26 = all_out_26_sql["SUM(num)"]; //出庫済み(全体)
				var all_out_27_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + this_stock + "AND purpose = 2 AND state = 7")[0];
				var all_out_27 = all_out_27_sql["SUM(num)"]; //返品数(全体)
				var all_out_28_sql = alasql("SELECT SUM(num) FROM trans WHERE stock =" + this_stock + "AND purpose = 2 AND state = 8 ")[0];
				var all_out_28 = all_out_28_sql["SUM(num)"]; //棚卸調整数(全体)
				var all_out_this_data_sql = alasql('SELECT num FROM trans WHERE id = ?', [id])[0];
				var all_out_this_data = all_out_this_data_sql["num"]; //変更対象データ数
				var input_data = num;
				var all_out_total = all_out_26 - all_out_27 - all_out_this_data + input_data; //1つのショップにおける 出庫数計 - 返品数 - 変更前データ数 + 変更後データ数
				if (all_out_total < 0){  //全体でマイナスにならないことをチェック
					$("#too_much").empty();
					var too_much_text = '(データ変更によりこの商品の倉庫在庫数が ' + all_out_total + ' となります。先に入庫・返品・棚卸調整データを修正してください。)';
					$("#too_much").append(too_much_text);
					$("#selected_num1").css("color","red");
					$("#order-form_number_span").css("color","red");
					$("#order-form_number_span").animate({opacity: 0.4},50);
					$("#order-form_number_span").animate({opacity: 1.0},50);
					$("#order-form_number_span").animate({opacity: 0.4},50);
					$("#order-form_number_span").animate({opacity: 1.0},50);
					return;
				}
				else{ //全体数でも矛盾なし：データ変更
					$("#too_much").empty();
					//全条件クリアでデータ更新 (納期未確定)
					if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 4){
					alasql("UPDATE trans SET purpose = 2, state = 4, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
					window.location.assign(last_url);
					}
					//全条件クリアでデータ更新 (納期確定済み)
					if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 5){
					alasql("UPDATE trans SET purpose = 2, state = 5, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
					window.location.assign(last_url);
					}
					//全条件クリアでデータ更新 (出庫済み)
					if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 6){
					alasql("UPDATE trans SET purpose = 2, state = 6, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
					window.location.assign(last_url);
					}
				}
			}
		}
		else{ //入力数増加のため、出庫済みの場合のみ、現在の在庫数を上回っていないかチェック
			$("#too_much").empty();
			//全条件クリアでデータ更新 (納期未確定)
			if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 4){
			alasql("UPDATE trans SET purpose = 2, state = 4, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
			window.location.assign(last_url);
			}
			//全条件クリアでデータ更新 (納期確定済み)
			if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 5){
			alasql("UPDATE trans SET purpose = 2, state = 5, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
			window.location.assign(last_url);
			}
			//全条件クリアでデータ更新 (出庫済み)：在庫数と比較
			if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 6){
				if( warehouse_stock_latest < 0){ //入力後に在庫数がマイナスとなる場合
					$("#too_much").empty();
					var too_much_text = '(データ更新によりこの商品の倉庫在庫数が ' + warehouse_stock_latest + ' となります。先に入庫・返品・棚卸調整データを修正してください。)';
					$("#too_much").append(too_much_text);
					$("#selected_num1").css("color","red");
					$("#order-form_number_span").css("color","red");
					$("#order-form_number_span").animate({opacity: 0.4},50);
					$("#order-form_number_span").animate({opacity: 1.0},50);
					$("#order-form_number_span").animate({opacity: 0.4},50);
					$("#order-form_number_span").animate({opacity: 1.0},50);
					return;
				}
				else{
					alasql("UPDATE trans SET purpose = 2, state = 6, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
					window.location.assign(last_url);
				}
			}
		}
	}
	else{ //変更前が出庫済みデータでないので変更可(出庫済みチェック必要)
		//全条件クリアでデータ更新 (納期未確定)
		if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 4){
		alasql("UPDATE trans SET purpose = 2, state = 4, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
		window.location.assign(last_url);
		}
		//全条件クリアでデータ更新 (納期確定済み)
		if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 5){
		alasql("UPDATE trans SET purpose = 2, state = 5, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
		window.location.assign(last_url);
		}
		//全条件クリアでデータ更新 (出庫済み)：出庫済みに変更時、在庫数がマイナスにならないようにする
		if (date_ok == 1 && shop_ok == 1 && num_ok == 1 && deadline_ok == 6){
			if( warehouse_stock_latest < 0){ //入力後に在庫数がマイナスとなる場合
				$("#too_much").empty();
				var too_much_text = '(データ更新によりこの商品の倉庫在庫数が ' + warehouse_stock_latest + ' となります。先に入庫・返品・棚卸調整データを修正してください。)';
				$("#too_much").append(too_much_text);
				$("#selected_num1").css("color","red");
				$("#order-form_number_span").css("color","red");
				$("#order-form_number_span").animate({opacity: 0.4},50);
				$("#order-form_number_span").animate({opacity: 1.0},50);
				$("#order-form_number_span").animate({opacity: 0.4},50);
				$("#order-form_number_span").animate({opacity: 1.0},50);
				return;
			}
			else{	
				alasql("UPDATE trans SET purpose = 2, state = 6, date = '" + date + "', deadline = '" + deadline + "', num = " + num + ", shop = '" + shop + "' WHERE id = " + id);
				window.location.assign(last_url);
			}
		}
	}	
});

// 取引先入力補助
var shop_rows = alasql('SELECT DISTINCT shop FROM trans WHERE purpose = 2 AND state = 4 OR state = 5 OR state = 6');
for (var i = 0; i < shop_rows.length; i++) {
	var shop_row = shop_rows[i];
	$('<option value = "' + shop_row.shop + '">').appendTo('#shops');
}

// ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
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