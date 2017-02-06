// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//プルダウン(商品区分：データ読み込み前に準備)
var rows = alasql('SELECT * FROM kind;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.kind.id);
	option.text(row.kind.text);
	$('select[name="item_data_kind_name"]').append(option);
}

//データ事前入力
if (isNaN(id) == true){
	$("#this_bread").text("NewData"); //パンくずリスト
	var item_id = alasql('SELECT MAX(id) + 1 as id FROM item')[0].id;
	$("#item_data_id_input").attr("value", item_id); //data No.
	//削除ボタン非表示
	$("#delete_item").css("display","none");
}
else{
	var item_object = alasql('SELECT * FROM item JOIN kind ON kind.id = item.kind WHERE item.id = ?', [ id ])[0];
	var item = $(item_object).attr("item"); //object皮むき(item)
	var item_kind = $(item_object).attr("kind"); //object皮むき(kind)
	$("#this_bread").text("Data No. " + item.id + " - " + item.maker + " : " + item.detail); //パンくずリスト
	$("#item_data_id_input").attr("value", item.id); //data No.
	$("#item_data_code_input").attr("value", item.code); //商品コード
	$("#item_data_kind_input").val(item.kind); //商品区分(kindのid番号でvalue指定)
	$("#item_data_maker_input").attr("value", item.maker); //メーカー
	$("#item_data_detail_input").attr("value", item.detail); //品番
	$("#item_data_price_input").attr("value", item.price); //単価
	$("#item_data_leadtime_input").attr("value", item.leadtime); //リードタイム
	$("#item_data_lack_input").val(item.lack); //許容欠品率(数値そのものをvalue指定)
	var using_item_inTrans = alasql('SELECT * FROM trans \
			JOIN stock ON stock.id = trans.stock \
			WHERE stock.item = ?', [ id ]); //transCSVの中に、消したいitem番号を持つstock.idが無いかチェック	
	var using_item_inTrans_num = using_item_inTrans.length; //使用中の個数
	if (using_item_inTrans_num != 0){ //使用中の場合、削除ボタン無効
		$("#delete_item").replaceWith('<button type="submit" class="btn btn-danger btn-xs" id="delete_item_not" data-toggle="tooltip" data-placement="top" title="在庫データに使用中のため削除不可"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> 削除</button>');
	}
}

//取引先入力補助
var makers_rows = alasql('SELECT DISTINCT maker FROM item');
for (var i = 0; i < makers_rows.length; i++) {
	var makers_row = makers_rows[i];
	$('<option value = "' + makers_row.maker + '">').appendTo('#makers');
}

//データ保存
$(function(){
	$(document).on("click","#update_item",function() {
	//商品コード5文字チェック
		var item_code_check = 0;
		var item_code = $('input[name="item_data_code_name"]').val();
		var item_code_num = item_code.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var item_code_length = item_code.length - item_code_num;
		if (item_code_length != 5){ //5文字以外の場合アウト		
			$("#item_data_code").css("color","red");
			$("#item_data_code_span").css("color","red");
			$("#item_data_code_span").animate({opacity: 0.4},50);
			$("#item_data_code_span").animate({opacity: 1.0},50);
			$("#item_data_code_span").animate({opacity: 0.4},50);
			$("#item_data_code_span").animate({opacity: 1.0},50);
			item_code_check = 0;
		}
		else{
			$("#item_data_code").css("color","black");
			$("#item_data_code_span").css("color","black");
			item_code_check = 1;
		}
	
	//商品区分チェック
		var item_kind = $("#item_data_kind_input").val();
		
	//メーカー20文字以内チェック
		var item_maker_check = 0;
		var item_maker = $('input[name="item_data_maker_name"]').val();
		var item_maker_num = item_maker.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var item_maker_length = item_maker.length - item_maker_num;
		if (item_maker_length == 0 || item_maker_length > 20){ //0文字 or 21文字以上の場合アウト		
			$("#item_data_maker").css("color","red");
			$("#item_data_maker_span").css("color","red");
			$("#item_data_maker_span").animate({opacity: 0.4},50);
			$("#item_data_maker_span").animate({opacity: 1.0},50);
			$("#item_data_maker_span").animate({opacity: 0.4},50);
			$("#item_data_maker_span").animate({opacity: 1.0},50);
			item_maker_check = 0;
		}
		else{
			$("#item_data_maker").css("color","black");
			$("#item_data_maker_span").css("color","black");
			item_maker_check = 1;
		}
		
	//品名30文字以内チェック
		var item_detail_check = 0;
		var item_detail = $('input[name="item_data_detail_name"]').val();
		var item_detail_num = item_detail.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var item_detail_length = item_detail.length - item_detail_num;
		if (item_detail_length == 0 || item_detail_length > 30){ //0文字 or 31文字以上の場合アウト		
			$("#item_data_detail").css("color","red");
			$("#item_data_detail_span").css("color","red");
			$("#item_data_detail_span").animate({opacity: 0.4},50);
			$("#item_data_detail_span").animate({opacity: 1.0},50);
			$("#item_data_detail_span").animate({opacity: 0.4},50);
			$("#item_data_detail_span").animate({opacity: 1.0},50);
			item_detail_check = 0;
		}
		else{
			$("#item_data_detail").css("color","black");
			$("#item_data_detail_span").css("color","black");
			item_detail_check = 1;
		}
		
	//単価7文字以内チェック
		var item_price_check = 0;
		var item_price = parseInt($('input[name="item_data_price_name"]').val());
		var item_price2 = $('input[name="item_data_price_name"]').val();
		var item_price_check = item_price - item_price2; //整数ならばゼロ
		if (item_price_check === 0 && item_price > 0 && item_price < 10000000){
			$("#item_data_price").css("color","black");
			$("#item_data_price_span").css("color","black");
			item_price_check = 1;
		}
		else {
			$("#item_data_price").css("color","red");
			$("#item_data_price_span").css("color","red");
			$("#item_data_price_span").animate({opacity: 0.4},50);
			$("#item_data_price_span").animate({opacity: 1.0},50);
			$("#item_data_price_span").animate({opacity: 0.4},50);
			$("#item_data_price_span").animate({opacity: 1.0},50);
			item_price_check = 0;
		}
		
		//リードタイム3文字以内チェック
		var item_leadtime_check = 0;
		var item_leadtime = parseInt($('input[name="item_data_leadtime_name"]').val());
		var item_leadtime2 = $('input[name="item_data_leadtime_name"]').val();
		var item_leadtime_check = item_leadtime - item_leadtime2; //整数ならばゼロ
		if (item_leadtime_check === 0 && item_leadtime > 0 && item_leadtime < 1000){
			$("#item_data_leadtime").css("color","black");
			$("#item_data_leadtime_span").css("color","black");
			item_leadtime_check = 1;
		}
		else {
			$("#item_data_leadtime").css("color","red");
			$("#item_data_leadtime_span").css("color","red");
			$("#item_data_leadtime_span").animate({opacity: 0.4},50);
			$("#item_data_leadtime_span").animate({opacity: 1.0},50);
			$("#item_data_leadtime_span").animate({opacity: 0.4},50);
			$("#item_data_leadtime_span").animate({opacity: 1.0},50);
			item_leadtime_check = 0;
		}

	//許容欠品率チェック
		var item_lack = $("#item_data_lack_input").val();
		
	//既存のデータと重複チェック
		if (item_code_check == 1 && item_maker_check == 1 && item_detail_check == 1 && item_price_check == 1 && item_leadtime_check == 1){
			if (isNaN(id) == true){
				var item_safestock = 0;
				var item_id = alasql('SELECT MAX(id) + 1 as id FROM item')[0].id;
				alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?,?,?)', [ item_id, item_code, item_kind, item_detail, item_maker, item_price, item_leadtime, item_lack, item_safestock ]);
			//stockCSV(whouseCSV)に登録済みのwhouseに対して、今回のitemIDを追加する
				var stock_whouse_objects = alasql('SELECT DISTINCT whouse FROM stock');
				for (var i = 0; i < stock_whouse_objects.length; i++) {
					var stock_whouse_object = stock_whouse_objects[i];
					var stock_whouse = $(stock_whouse_object).attr("whouse"); //object皮むき(whouse番号取得)
					var stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
					alasql('INSERT INTO stock VALUES(?,?,?,?,?,?)', [ stock_id, item_id, stock_whouse, 0, 0, 0 ]); //stockCSVにデータ追加
					var test = alasql('SELECT * FROM stock');
				}
			}
			else{
				var item_id = id;
				alasql("UPDATE item SET code = '" + item_code + "', kind = '" + item_kind + "', detail = '" + item_detail + "', maker = '" + item_maker + "', price = '" + item_price + "', leadtime = '" + item_leadtime + "', lack = '" + item_lack + "' WHERE id = " + item_id);
			}
		window.location.assign('index-item-info.html');
		}
	});
});

//登録データ削除
$(function(){ //SQL内のデータを削除し、結果的にテーブルから削除
	$(document).on("click","#delete_item",function() {
		alasql('DELETE FROM item WHERE id = ' + id)[0]; //idを用いてデータを削除する
		window.location.assign('index-item-info.html');
	});
});

//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});