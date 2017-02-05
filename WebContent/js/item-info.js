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
	var using_item_inStock = alasql('SELECT * FROM stock WHERE item = ?', [ id ]); //stockCSVの中で使用中かチェック
	var using_item_inStock_num = using_item_inStock.length; //使用中の個数
	if (using_item_inStock_num != 0){ //使用中の場合、削除ボタン無効
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
	//倉庫名10文字以内チェック
		var item_text_check = 0;
		var item_text = $('input[name="item_data_text_name"]').val();
		var item_text_num = item_text.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var item_text_length = item_text.length - item_text_num;
		if (item_text_length == 0 || item_text_length > 10){ //0文字 or 11文字以上の場合アウト		
			$("#item_data_text").css("color","red");
			$("#item_data_text_span").css("color","red");
			$("#item_data_text_span").animate({opacity: 0.4},50);
			$("#item_data_text_span").animate({opacity: 1.0},50);
			$("#item_data_text_span").animate({opacity: 0.4},50);
			$("#item_data_text_span").animate({opacity: 1.0},50);
			item_text_check = 0;
		}
		else{
			$("#item_data_text").css("color","black");
			$("#item_data_text_span").css("color","black");
			item_text_check = 1;
		}
	//住所30文字以内チェック
		var item_addr_check = 0;
		var item_addr = $('input[name="item_data_addr_name"]').val();
		var item_addr_num = item_addr.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var item_addr_length = item_addr.length - item_addr_num;
		if (item_addr_length == 0 || item_addr_length > 30){ //0文字 or 31文字以上の場合アウト		
			$("#item_data_addr").css("color","red");
			$("#item_data_addr_span").css("color","red");
			$("#item_data_addr_span").animate({opacity: 0.4},50);
			$("#item_data_addr_span").animate({opacity: 1.0},50);
			$("#item_data_addr_span").animate({opacity: 0.4},50);
			$("#item_data_addr_span").animate({opacity: 1.0},50);
			item_addr_check = 0;
		}
		else{
			$("#item_data_addr").css("color","black");
			$("#item_data_addr_span").css("color","black");
			item_addr_check = 1;
		}
	//電話番号15文字以内チェック
		var item_tel_check = 0;
		var item_tel = $('input[name="item_data_tel_name"]').val();
		var item_tel_num = item_tel.split(/[\uD800-\udbff][\uDC00-\uDFFF]/g).length - 1; //サロゲートペアチェック
		var item_tel_length = item_tel.length - item_tel_num;
		if (item_tel_length == 0 || item_tel_length > 15){ //0文字 or 16文字以上の場合アウト		
			$("#item_data_tel").css("color","red");
			$("#item_data_tel_span").css("color","red");
			$("#item_data_tel_span").animate({opacity: 0.4},50);
			$("#item_data_tel_span").animate({opacity: 1.0},50);
			$("#item_data_tel_span").animate({opacity: 0.4},50);
			$("#item_data_tel_span").animate({opacity: 1.0},50);
			item_tel_check = 0;
		}
		else{
			$("#item_data_tel").css("color","black");
			$("#item_data_tel_span").css("color","black");
			item_tel_check = 1;
		}
		
	//既存のデータと重複チェック
		if (item_text_check == 1 && item_addr_check == 1 && item_tel_check == 1){
			if (isNaN(id) == true){
				var item_id = alasql('SELECT MAX(id) + 1 as id FROM item')[0].id;
				alasql('INSERT INTO item VALUES(?,?,?,?)', [ item_id, item_text, item_addr, item_tel ]);
			}
			else{
				var item_id = id;
				alasql("UPDATE item SET name = '" + item_text + "', addr = '" + item_addr + "', tel = '" + item_tel + "' WHERE id = " + item_id);
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